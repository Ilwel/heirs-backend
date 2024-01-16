include .env

.PHONY : up

up: 
	sudo docker-compose build
	sudo docker-compose up -d

.PHONY :down

down: 
	sudo docker-compose down

.PHONY : logs

logs: 
	sudo docker-compose logs -d