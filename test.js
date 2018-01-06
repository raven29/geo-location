var maxmind = require('maxmind');
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('dionaea.sqlite');

// db.all('select count(*), connection_protocol from `connections` group by connection_protocol', (err, data) => {
//   console.log(data);
// });

maxmind.open('GeoLite2-Country.mmdb', (err, countryLookup) => {
  var geodata;
  var country;
  var country_data;
  var id;
  var attacks_per_country = {};
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
});

