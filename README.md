# ProfileCreator
	Web aplikacija koja se bavi pracenjem korisnickih aktivnosti putem izvrsavanja zadataka.

## Tehnologije
	Backend:
		ASP.NET Core Web API
		C#
		Entity Framework Core

	Frontend:
		HTML
		CSS
		JavaScript (Vanilla)

	Database:
		Za potrebe ove aplikacije je koriscen SQL LocalDB kao i Azure Data Studio za pregled same baze.

## Funkcionalnosti
	Registracija korisnika
	Login sa JWT autentifikacijom
	Upload profilne slike
	Promena teme aplikacije
	Promene informacija o korisniku (email, username, profilna slika)
	Dodavanje, brisanje, izmena zadataka
	Pregled zadataka i filtriranje po kriterijumima
	Statisticko pracenje izvrsavanja zadataka na nedeljnom i mesecnom nivou
	Brisanje korisnickog profila

## Pokretanje projekta
	Backend:
		cd Backend
		dotnet restore
		dotnet build
		dotnet run/watch run
		
		Backend se pokrece na 'http://localhost:5000'
	
	Frontend:
		Otvoriti 'Frontend/pages/login.html' u browser ili putem Live Server ekstenzije u VS Code pokrenuti navedenu stranicu.

	Database:
		Sama baza se kreira komandom: `sqllocaldb create imeBaze` gde je 'imeBaze' ime koje se navodi u okviru CS-a u appSettings.json fajlu.
		Nakon toga je potrebno startovati samu bazu podataka naredbom 'sqllocaldb start imeBaze'.
		Nakon toga, kreira se migracija pomocu 'dotnet ef migrations add InitialState'.
		Poslednji korak je komanda 'dotnet ef database update' komanda kojom se kreira baza i tabele u istoj.

## VAZNO
	Potrebno je u appsettings.json fajlu podesiti JWT Key kao i CS.

## Autor
	GitHub: https://github.com/Lacko35