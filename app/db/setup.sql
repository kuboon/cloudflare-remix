DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id varchar(255) NOT NULL,
  userName varchar(255) NOT NULL,
  registered boolean NOT NULL,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS creds;
CREATE TABLE creds (
  credId varchar(255) NOT NULL,
  userId varchar(255) NOT NULL,
  publicKey varchar(255) NOT NULL,
  type varchar(255) NOT NULL,
  transports varchar(255) NOT NULL,
  counter int NOT NULL,
  created_at varchar(100) NOT NULL,
  PRIMARY KEY (credId)
);
