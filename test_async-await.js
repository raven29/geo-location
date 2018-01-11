const maxmind = require('maxmind');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('dionaea.sqlite');

getSelectedCountries();

function openGeoLite2(){
  return new Promise (function(resolve, reject){
    maxmind.open('GeoLite2-Country.mmdb', (err, countryLookup) => {
      if (err) {
        reject(err);
      } else {
        resolve(countryLookup);
      }
    });
  });
}

async function getSelectedCountries(){
  let countryLookup;
  try {
    countryLookup = await openGeoLite2();
  } catch(err) {
    console.log(err)
  }
  selectCountries(countryLookup);
}

function selectCountries(countryLookup){
  let geodata;
  let country;
  let country_data;
  let id;
  const attacks_per_country = {};
  db.each('select count(*) as attacks_number, remote_host from `connections` group by remote_host order by remote_host', (err, data) => {
    geodata = countryLookup.get(data.remote_host);
    if (geodata && geodata.registered_country) {
      country = geodata.registered_country;
      country_data = {
        id: country.iso_code,
        name: country.names.en
      }
    } else {
      country_data = {
        id: data.remote_host,
        name: data.remote_host
      };
    }
    id = country_data.id;
    if (attacks_per_country[id]) {
      attacks_per_country[id].count += 1;
    } else {
      attacks_per_country[id] = {
        count: 1,
        name: country_data.name
      }
    }
  }, (err) => {
    console.log(attacks_per_country);
  });
}
