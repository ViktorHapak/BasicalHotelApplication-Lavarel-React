CREATE TABLE user(
      id INT(5) UNSIGNED ZEROFILL NULL AUTO_INCREMENT PRIMARY KEY,
      name varchar(50) NOT NULL UNIQUE,
      email varchar(50) NOT NULL UNIQUE,
      birth date NOT NULL CHECK(birth > 1900/01/01 ),
      password varchar(50) NOT NULL,
      created_at TIMESTAMP,
      role smallint CHECK (role<2)

);

CREATE TABLE room_reservation(
      id INT(5) UNSIGNED ZEROFILL NULL AUTO_INCREMENT PRIMARY KEY,
      user_id int REFERENCES user(id) ON DELETE CASCADE,
      room_id int REFERENCES room(id) ON DELETE CASCADE,
      UNIQUE(user_id,room_id),
      cost int(5) UNSIGNED,
      days int(4) UNSIGNED,
      requested_at TIMESTAMP,
      reserved_at DATETIME,
      status varchar(20) CHECK ( 'PENDING' || 'ACCEPTED' || 'EXPIRED')
);

CREATE TABLE room(
     id INT(5) UNSIGNED ZEROFILL NULL AUTO_INCREMENT PRIMARY KEY,
     floor int(3),
     serial_number int(3) UNSIGNED,
     room_number varchar(30) NOT NULL UNIQUE,
     UNIQUE(floor, serial_number),
     price int(4)
)