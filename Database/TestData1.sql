create table Person (
   id int auto_increment primary key,
   firstName varchar(30),
   lastName varchar(30) not null,
   email varchar(30) not null,
   password varchar(50),
   whenRegistered datetime not null,
   termsAccepted datetime,
   role int unsigned not null,  # 0 normal, 1 admin
   unique key(email)
);

create table Restaurant (
   id int auto_increment primary key,
   ownerId int,
   title varchar(80) not null,
   description varchar(300),
   url varchar(80) not null,
   category varchar(80) not null,
   lastReview datetime,
   constraint FKReview_ownerId foreign key (ownerId) references Person(id)
    on delete cascade,
   unique key UK_title(title)
);

create table Review (
   id int auto_increment primary key,
   rstId int not null,
   prsId int not null,
   whenMade datetime not null,
   content varchar(5000) not null,
   rating int,
   ownerResponseWhenMade datetime,
   ownerResponseContent varchar(5000),
   constraint FKReview_rstId foreign key (rstId) references Restaurant(id)
    on delete cascade,
   constraint FKReview_prsId foreign key (prsId) references Person(id)
    on delete cascade
);

create table Vote (
   id int auto_increment primary key,
   rstId int not null,
   revId int not null,
   prsId int not null,
   voteValue tinyint not null,
   constraint FKVote_rstId foreign key (rstId) references Restaurant(id)
    on delete cascade,
   constraint FKVote_revId foreign key (revId) references Review(id)
    on delete cascade,
   constraint FKVote_prsId foreign key (prsId) references Person(id)
    on delete cascade
);

insert into Person (firstName, lastName, email, password, whenRegistered, role, termsAccepted)
   VALUES ("Joe",     "Admin", "adm@11.com", "password", NOW(), 1, NOW()),
   ("Bob", "Person2", "user@place.com", "password1", NOW(), 0, NOW()),
   ("Jeff", "Anybody", "jeff@gmail.org", "password2", NOW(), 0, NOW()),
   ("Mary", "Stu", "mary.stu@g.mail", "password3", NOW(), 0, NOW()),
   ("Frank", "Person5", "person5@domain5", "password4", NOW(), 0, NOW()),
   ("Hater", "McBadguy", "i.hate.u@domain6", "password5", NOW(), 0, NOW()),
   ("Noname", "McNoname", "nobody@domain7", "password6", NOW(), 0, NOW());
   
insert into Restaurant (ownerId, title, description, url, category)
   VALUES (1, "Joe's", NULL, "eat@joes.com", "Fine Dining"),
   (4, "Mary's Bakery", NULL, "contact@marys-bakery.com", "Bakery"),
   (5, "Frank's Place 1", "Location 1", "place1@frank.com", "Burgers"),
   (5, "Frank's Place 2", "Location 2", "place2@frank.com", "Burgers"),
   (5, "Frank's Place 3", "Location 3", "place3@frank.com", "Burgers"),
   (5, "Frank's Place 4", "Location 4", "place4@frank.com", "Burgers");
   
insert into Review (rstId, prsId, whenMade, content, rating)
   VALUES (1, 2, NOW(), "Great food!", 5),
   (1, 3, NOW(), "Great food!", 5),
   (1, 4, NOW(), "Okay food", 3),
   (1, 6, NOW(), "TERRIBL", 1),
   (2, 1, NOW(), "Good food!", 4),
   (2, 2, NOW(), "Great food!", 5),
   (2, 6, NOW(), "AFWL", 1),
   (3, 1, NOW(), "Okay food", 3),
   (3, 2, NOW(), "Great food!", 5),
   (3, 4, NOW(), "Good food!", 4),
   (3, 6, NOW(), "RELLLY BAD", 1);

insert into Vote (rstId, revId, prsId, voteValue)
   VALUES (1, 4, 1, -1),
   (1, 4, 2, -1),
   (1, 4, 4, -1),
   (1, 4, 5, -1),
   (2, 7, 1, -1),
   (2, 7, 2, -1),
   (3, 11, 1, -1),
   (3, 11, 2, -1),
   (3, 11, 3, -1),
   (3, 11, 4, -1),
   (3, 11, 7, 1),
   (1, 1, 4, 1),
   (2, 5, 2, 1),
   (2, 5, 4, 1),
   (3, 8, 2, 1),
   (3, 8, 3, 1),
   (3, 8, 4, 1);