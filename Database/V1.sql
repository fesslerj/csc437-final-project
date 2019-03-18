drop database if exists radical_restaurants;
create database radical_restaurants;
use radical_restaurants;

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
   constraint FKReview_rstId foreign key (rstId) references Restaurant(id)
    on delete cascade,
   constraint FKReview_prsId foreign key (prsId) references Person(id)
    on delete cascade
);

insert into Person (firstName, lastName, email, password, whenRegistered, role)
   VALUES ("Joe",     "Admin", "adm@11.com", "password", NOW(), 1);
