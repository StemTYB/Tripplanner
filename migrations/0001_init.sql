-- Migración inicial: schema + datos de ejemplo (viaje a Japón)
-- Mismo approach que la versión SQLite: cada fila guarda el objeto completo
-- como JSON en 'payload', así el schema nunca se desincroniza de la forma
-- que usa el frontend cuando se agregan campos nuevos.

CREATE TABLE IF NOT EXISTS trip (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS destinations (
  id TEXT PRIMARY KEY,
  dest_id TEXT,
  sort_order INTEGER,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stays (
  id TEXT PRIMARY KEY,
  dest_id TEXT,
  sort_order INTEGER,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transports (
  id TEXT PRIMARY KEY,
  dest_id TEXT,
  sort_order INTEGER,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  dest_id TEXT,
  sort_order INTEGER,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  dest_id TEXT,
  sort_order INTEGER,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shopping (
  id TEXT PRIMARY KEY,
  dest_id TEXT,
  sort_order INTEGER,
  payload TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  dest_id TEXT,
  sort_order INTEGER,
  payload TEXT NOT NULL
);

INSERT INTO trip (id, payload) VALUES (1, '{"name":"Japón 2026","startDate":"2026-12-11","endDate":"2027-01-14"}');
INSERT INTO destinations (id, dest_id, sort_order, payload) VALUES ('dest-1', NULL, 1, '{"id":"dest-1","name":"Takayama","region":"Gifu, Japón","order":1,"startDate":"2026-12-16","endDate":"2026-12-18","color":"sky","mapPos":{"x":54,"y":33},"coords":{"lat":36.1408,"lng":137.2529},"note":"Casco histórico + día trip a Shirakawa-go"}');
INSERT INTO destinations (id, dest_id, sort_order, payload) VALUES ('dest-2', NULL, 2, '{"id":"dest-2","name":"Osaka","region":"Kansai, Japón","order":2,"startDate":"2026-12-18","endDate":"2026-12-25","color":"gold","mapPos":{"x":47,"y":57},"coords":{"lat":34.6937,"lng":135.5023},"note":"Base para Kioto, Nara y Kobe"}');
INSERT INTO destinations (id, dest_id, sort_order, payload) VALUES ('dest-3', NULL, 3, '{"id":"dest-3","name":"Tokio","region":"Kanto, Japón","order":3,"startDate":"2026-12-25","endDate":"2027-01-14","color":"sage","mapPos":{"x":70,"y":39},"coords":{"lat":35.6762,"lng":139.6503},"note":"Shibuya, Akihabara, Nakano, Yokohama, Kawaguchiko y más"}');
INSERT INTO stays (id, dest_id, sort_order, payload) VALUES ('stay-1', 'dest-1', 0, '{"id":"stay-1","destId":"dest-1","name":"Takayama Guesthouse Sosuke","type":"hostel","checkIn":"2026-12-16","checkOut":"2026-12-18","address":"Casco antiguo, Takayama","note":"Básico y económico, solo para dormir"}');
INSERT INTO stays (id, dest_id, sort_order, payload) VALUES ('stay-2', 'dest-2', 1, '{"id":"stay-2","destId":"dest-2","name":"Namba Backpackers","type":"hostel","checkIn":"2026-12-18","checkOut":"2026-12-25","address":"Namba, Osaka","note":"Cerca de Dotonbori"}');
INSERT INTO stays (id, dest_id, sort_order, payload) VALUES ('stay-3', 'dest-3', 2, '{"id":"stay-3","destId":"dest-3","name":"K''s House Tokyo Oasis","type":"hostel","checkIn":"2026-12-25","checkOut":"2027-01-05","address":"Asakusa, Tokio","note":"Primera mitad en Tokio"}');
INSERT INTO stays (id, dest_id, sort_order, payload) VALUES ('stay-4', 'dest-3', 3, '{"id":"stay-4","destId":"dest-3","name":"Nui. Hostel & Bar Lounge","type":"hostel","checkIn":"2027-01-05","checkOut":"2027-01-14","address":"Kuramae, Tokio","note":"Segunda mitad, más cerca de Akihabara"}');
INSERT INTO transports (id, dest_id, sort_order, payload) VALUES ('trans-1', NULL, 0, '{"id":"trans-1","type":"car","from":"Ciudad Juárez","to":"San Diego, CA","depDate":"2026-12-11","depTime":"09:00","arrDate":"2026-12-11","arrTime":"11:30","carrier":"Cruce fronterizo","note":"Cruce Juárez–El Paso y traslado a San Diego"}');
INSERT INTO transports (id, dest_id, sort_order, payload) VALUES ('trans-2', NULL, 1, '{"id":"trans-2","type":"flight","from":"San Diego (SAN)","to":"Tokio Haneda (HND)","depDate":"2026-12-12","depTime":"13:20","arrDate":"2026-12-13","arrTime":"17:05","carrier":"Vuelo internacional","note":"Cruza la línea de fecha"}');
INSERT INTO transports (id, dest_id, sort_order, payload) VALUES ('trans-3', NULL, 2, '{"id":"trans-3","type":"train","from":"Tokio","to":"Takayama","depDate":"2026-12-16","depTime":"08:10","arrDate":"2026-12-16","arrTime":"12:15","carrier":"JR Wide View Hida","note":"Vía Nagoya"}');
INSERT INTO transports (id, dest_id, sort_order, payload) VALUES ('trans-4', NULL, 3, '{"id":"trans-4","type":"train","from":"Takayama","to":"Osaka","depDate":"2026-12-18","depTime":"10:30","arrDate":"2026-12-18","arrTime":"13:45","carrier":"JR + Shinkansen","note":"Vía Nagoya"}');
INSERT INTO transports (id, dest_id, sort_order, payload) VALUES ('trans-5', NULL, 4, '{"id":"trans-5","type":"train","from":"Osaka","to":"Tokio","depDate":"2026-12-25","depTime":"09:00","arrDate":"2026-12-25","arrTime":"11:30","carrier":"Shinkansen Nozomi","note":""}');
INSERT INTO transports (id, dest_id, sort_order, payload) VALUES ('trans-6', NULL, 5, '{"id":"trans-6","type":"flight","from":"Tokio Haneda (HND)","to":"San Diego (SAN)","depDate":"2027-01-14","depTime":"17:50","arrDate":"2027-01-14","arrTime":"10:15","carrier":"Vuelo internacional","note":"Llega el mismo día por el cambio de fecha"}');
INSERT INTO transports (id, dest_id, sort_order, payload) VALUES ('trans-7', NULL, 6, '{"id":"trans-7","type":"car","from":"San Diego, CA","to":"Ciudad Juárez","depDate":"2027-01-14","depTime":"13:00","arrDate":"2027-01-14","arrTime":"15:30","carrier":"Traslado","note":"Regreso a casa"}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-1', 'dest-1', 0, '{"id":"place-1","destId":"dest-1","name":"Shirakawa-go","category":"naturaleza","note":"Día trip, pueblo histórico gassho-zukuri","visited":false,"mapPos":{"x":50,"y":28}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-2', 'dest-1', 1, '{"id":"place-2","destId":"dest-1","name":"Casco antiguo de Takayama","category":"cultura","note":"Solo si queda de paso, Sanmachi Suji","visited":false,"mapPos":{"x":55,"y":34}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-3', 'dest-2', 2, '{"id":"place-3","destId":"dest-2","name":"Kioto (día trip)","category":"cultura","note":"Visita casual, sin prisa por templos icónicos","visited":false,"mapPos":{"x":49,"y":54}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-4', 'dest-2', 3, '{"id":"place-4","destId":"dest-2","name":"Nara","category":"naturaleza","note":"Parque de los ciervos, visita relajada","visited":false,"mapPos":{"x":50,"y":58}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-5', 'dest-2', 4, '{"id":"place-5","destId":"dest-2","name":"Kobe","category":"auto","note":"Explorar escena JDM y posibles car meetings","visited":false,"mapPos":{"x":46,"y":59}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-6', 'dest-2', 5, '{"id":"place-6","destId":"dest-2","name":"Den Den Town","category":"compras","note":"Hard-Off, Book-Off, 2nd Street — figuras, TCG y retro","visited":false,"mapPos":{"x":47.5,"y":57.5}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-7', 'dest-2', 6, '{"id":"place-7","destId":"dest-2","name":"Dotonbori","category":"noche","note":"Bares, izakayas y vida nocturna","visited":false,"mapPos":{"x":47.2,"y":57.3}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-8', 'dest-3', 7, '{"id":"place-8","destId":"dest-3","name":"Akihabara","category":"compras","note":"Figuras, juegos retro, tiendas de segunda mano","visited":false,"mapPos":{"x":71,"y":40}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-9', 'dest-3', 8, '{"id":"place-9","destId":"dest-3","name":"Nakano Broadway","category":"compras","note":"Otaku goods y coleccionables","visited":false,"mapPos":{"x":69,"y":39.5}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-10', 'dest-3', 9, '{"id":"place-10","destId":"dest-3","name":"Shimokitazawa","category":"compras","note":"Thrifting y ropa vintage","visited":false,"mapPos":{"x":68,"y":40.2}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-11', 'dest-3', 10, '{"id":"place-11","destId":"dest-3","name":"Kōenji","category":"compras","note":"Vinilos y tiendas vintage","visited":false,"mapPos":{"x":67.5,"y":39.8}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-12', 'dest-3', 11, '{"id":"place-12","destId":"dest-3","name":"Daikoku PA","category":"auto","note":"Punto clásico de car meetings, cerca de Yokohama","visited":false,"mapPos":{"x":73,"y":43}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-13', 'dest-3', 12, '{"id":"place-13","destId":"dest-3","name":"Kawaguchiko","category":"naturaleza","note":"Vista al Monte Fuji + el Lawson icónico","visited":false,"mapPos":{"x":62,"y":41}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-14', 'dest-3', 13, '{"id":"place-14","destId":"dest-3","name":"Museo Ghibli","category":"cultura","note":"Reservar boletos con anticipación","visited":false,"mapPos":{"x":66,"y":40}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-15', 'dest-3', 14, '{"id":"place-15","destId":"dest-3","name":"Odaiba","category":"entretenimiento","note":"Zona futurista frente a la bahía","visited":false,"mapPos":{"x":71,"y":42}}');
INSERT INTO places (id, dest_id, sort_order, payload) VALUES ('place-16', 'dest-3', 15, '{"id":"place-16","destId":"dest-3","name":"Shibuya / Harajuku","category":"entretenimiento","note":"Cruce icónico, moda y ambiente","visited":false,"mapPos":{"x":69,"y":40.5}}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-1', 'dest-1', 0, '{"id":"act-1","date":"2026-12-16","time":"14:00","title":"Caminar por el casco antiguo","category":"cultura","destId":"dest-1","placeId":"place-2","note":""}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-2', 'dest-1', 1, '{"id":"act-2","date":"2026-12-17","time":"09:00","title":"Día trip a Shirakawa-go","category":"naturaleza","destId":"dest-1","placeId":"place-1","note":"Bus desde Takayama, ida y vuelta"}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-3', 'dest-2', 2, '{"id":"act-3","date":"2026-12-19","time":"20:00","title":"Noche en Dotonbori","category":"noche","destId":"dest-2","placeId":"place-7","note":"Izakaya + caminar por los canales"}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-4', 'dest-2', 3, '{"id":"act-4","date":"2026-12-20","time":"10:00","title":"Compras en Den Den Town","category":"compras","destId":"dest-2","placeId":"place-6","note":"Buscar figuras y TCG"}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-5', 'dest-2', 4, '{"id":"act-5","date":"2026-12-21","time":"09:30","title":"Día trip casual a Kioto","category":"cultura","destId":"dest-2","placeId":"place-3","note":"Sin itinerario fijo"}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-6', 'dest-2', 5, '{"id":"act-6","date":"2026-12-22","time":"10:00","title":"Nara y el parque de los ciervos","category":"naturaleza","destId":"dest-2","placeId":"place-4","note":""}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-7', 'dest-2', 6, '{"id":"act-7","date":"2026-12-23","time":"11:00","title":"Explorar Kobe y escena JDM","category":"auto","destId":"dest-2","placeId":"place-5","note":"Evaluar transporte para car meetings"}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-8', 'dest-3', 7, '{"id":"act-8","date":"2026-12-27","time":"11:00","title":"Akihabara: figuras y retro games","category":"compras","destId":"dest-3","placeId":"place-8","note":""}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-9', 'dest-3', 8, '{"id":"act-9","date":"2026-12-28","time":"12:00","title":"Nakano Broadway","category":"compras","destId":"dest-3","placeId":"place-9","note":""}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-10', 'dest-3', 9, '{"id":"act-10","date":"2026-12-29","time":"13:00","title":"Shimokitazawa + Kōenji: vinilos y thrift","category":"compras","destId":"dest-3","placeId":"place-10","note":""}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-11', 'dest-3', 10, '{"id":"act-11","date":"2026-12-31","time":"21:00","title":"Car meeting en Daikoku PA","category":"auto","destId":"dest-3","placeId":"place-12","note":"Fin de año viendo autos"}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-12', 'dest-3', 11, '{"id":"act-12","date":"2027-01-01","time":"20:00","title":"Izakaya y karaoke en Shibuya","category":"noche","destId":"dest-3","placeId":"place-16","note":"Año nuevo"}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-13', 'dest-3', 12, '{"id":"act-13","date":"2027-01-05","time":"07:00","title":"Kawaguchiko: vista al Fuji","category":"naturaleza","destId":"dest-3","placeId":"place-13","note":"No olvidar el Lawson con vista al Fuji"}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-14', 'dest-3', 13, '{"id":"act-14","date":"2027-01-06","time":"10:00","title":"Museo Ghibli","category":"cultura","destId":"dest-3","placeId":"place-14","note":"Boletos reservados con anticipación"}');
INSERT INTO activities (id, dest_id, sort_order, payload) VALUES ('act-15', 'dest-3', 14, '{"id":"act-15","date":"2027-01-10","time":"11:00","title":"Tarde en Odaiba","category":"entretenimiento","destId":"dest-3","placeId":"place-15","note":""}');
INSERT INTO shopping (id, dest_id, sort_order, payload) VALUES ('shop-1', NULL, 0, '{"id":"shop-1","name":"Figura de Denji (Chainsaw Man)","zone":"Nakano Broadway","summary":"Buscar en tiendas de segunda mano, versión prize o ichiban kuji","estPrice":1500,"actualPrice":"","acquired":false}');
INSERT INTO shopping (id, dest_id, sort_order, payload) VALUES ('shop-2', NULL, 1, '{"id":"shop-2","name":"Cartas sueltas de Pokémon TCG","zone":"Card shops en Akihabara","summary":"Sets antiguos, buscar singles en buen estado","estPrice":3000,"actualPrice":"","acquired":false}');
INSERT INTO shopping (id, dest_id, sort_order, payload) VALUES ('shop-3', NULL, 2, '{"id":"shop-3","name":"Cartucho retro de Famicom","zone":"Super Potato / Hard-Off","summary":"Probar que funcione antes de comprar si se puede","estPrice":2500,"actualPrice":"","acquired":false}');
INSERT INTO shopping (id, dest_id, sort_order, payload) VALUES ('shop-4', NULL, 3, '{"id":"shop-4","name":"Vinilo de City Pop","zone":"Kōenji","summary":"Tatsuro Yamashita, Mariya Takeuchi o similar","estPrice":1800,"actualPrice":"","acquired":false}');
INSERT INTO shopping (id, dest_id, sort_order, payload) VALUES ('shop-5', NULL, 4, '{"id":"shop-5","name":"Chamarra vintage streetwear","zone":"Shimokitazawa","summary":"Algo con vibra Y2K, revisar tallas","estPrice":4000,"actualPrice":"","acquired":false}');
INSERT INTO shopping (id, dest_id, sort_order, payload) VALUES ('shop-6', NULL, 5, '{"id":"shop-6","name":"Tomos sueltos de manga","zone":"Book-Off","summary":"Cualquier serie interesante, buscar precios bajos","estPrice":3000,"actualPrice":"","acquired":false}');
INSERT INTO shopping (id, dest_id, sort_order, payload) VALUES ('shop-7', NULL, 6, '{"id":"shop-7","name":"Llavero gacha random","zone":"Akihabara","summary":"Se consiguió el primer día en una máquina gacha","estPrice":300,"actualPrice":300,"acquired":true}');
INSERT INTO notes (id, dest_id, sort_order, payload) VALUES ('note-1', NULL, 0, '{"id":"note-1","title":"Prioridad de compras","content":"Enfocar tiempo y presupuesto en tiendas de segunda mano (Hard-Off, Book-Off, 2nd Street) para figuras, cartas TCG, juegos retro, vinilos y ropa urbana."}');
INSERT INTO notes (id, dest_id, sort_order, payload) VALUES ('note-2', NULL, 1, '{"id":"note-2","title":"Qué evitar","content":"Nada de Comiket (demasiada gente) ni Universal Studios Japan (muy caro). Si sobra tiempo en esos huecos, dejarlo libre o volver al plan original."}');
INSERT INTO notes (id, dest_id, sort_order, payload) VALUES ('note-3', NULL, 2, '{"id":"note-3","title":"Transporte","content":"Preferir transporte público económico. Explorar por zonas usando marcadores guardados en Google Maps, con ritmo flexible, sin horarios forzados."}');
INSERT INTO notes (id, dest_id, sort_order, payload) VALUES ('note-4', NULL, 3, '{"id":"note-4","title":"Alojamiento","content":"Buscar siempre opciones económicas y básicas — solo para dormir y guardar las compras del día."}');
