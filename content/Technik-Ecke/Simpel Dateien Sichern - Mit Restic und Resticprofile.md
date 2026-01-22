---
Title: Simpel Dateien Sichern - Mit Restic und Resticprofile
tags:
  - how-to
  - server
  - computer
date: 2025-04-18
---
Backups sind wichtig. Ob von deinem Server, deinem Computer oder deinem Laptop. Leider vermögen nicht alle Tools diesen Prozess einfach zu gestalten. Wäre ein Tool nicht schön, welches einheitlich auf all deinen Geräten funktioniert, selbstständig verschlüsselt und inkrementelle Backups ermöglicht - und das alles nur über eine CLI? Genau das macht **Restic**! Und um das alles auch Cross Device zu ermöglichen, können die Profile ganz einfach mit **Resticprofile** verwaltet werden!

# Alles hat einen Anfang - Die Grundlagen

Bevor wir mit der spannenden Konfiguration und dem *How-To-Teil* anfangen können, müssen wir erstmal die Theorie klären. *Ihr könnt das auch überspringen, ich bin nicht eurer Lehrer!*

## Was ist Restic?

[**Restic**](https://restic.readthedocs.io/en/stable/010_introduction.html) ist ein schnelles und sicheres Backupsystem. Es ermöglicht, Daten mittels einfacher Konfiguration auf vielen verschiedenen Medien zu sichern. Diese Medien heißen [**Repository**](https://restic.readthedocs.io/en/stable/030_preparing_a_new_repo.html). Restic kümmert sich über Verschlüsselung, Versionsverwaltung und vieles mehr - du musst nur die richtigen Einstellungen vornehmen.

Dieses Tutorial soll aber nicht erklären, wie man Restic direkt nutzt (das ist ziemlich selbsterklärend, ein guter Startpunkt bietet der [Quickstart-Guide](https://restic.readthedocs.io/en/stable/010_introduction.html#quickstart-guide)). Vielmehr möchte ich mit euch teilen, wie man Restic mittels **Resticprofile** noch einfacher nutzen kann!

## Restic Repositories

Ein Repository in Restic ist einfach ein Speicherort für die Backups. Das kann ein SFTP-Server, S3-Server oder eines der vielen anderen unterstützten Backends[^1] sein. 

Repositories sind mit einem **Key** gesichert, welcher die Daten verschlüsselt und dafür sorgt, dass niemand einfach nur mittels Zugriff auf das Backend eure Daten sieht.

Desweiteren lassen sich auf einem Repository mehrere Geräte (sogenannte **Hosts**) sichern. Restic erkennt automatisch, welche Backups zu welchem Gerät gehören, kann aber alle überall wieder herstellen. Viele Restic-Befehle unterstützen den Parameter `--host`, wodurch sich einfach die Backups von anderen Geräten überprüfen und herstellen lassen.

## Was ist Resticprofile?

Restic selber bietet keine Möglichkeit, einfach die Credentials für ein Repository zu speichern und so regelmäßige Backups zu ermöglichen[^2]. Genau dafür gibt es [**Resticprofile**](https://creativeprojects.github.io/resticprofile/index.html). Dieses Tool erlaubt es uns, die Credentials für ein Restic-Repository einfach in einer JSON / YAML / ... Datei zu speichern und sogar automatisiert regelmäßige Backups durchzuführen.

# Die Kunst der Sicherung - Wie nutze ich Restic?

## Installation

Um Restic und Resticprofile zu nutzen, müssen wir diese Tools zunächst installieren.

### Restic

> Mehr Details siehe [Installation](https://restic.readthedocs.io/en/stable/020_installation.html)

Restic ist in fast allen Package-Repositories vorhanden. Für Debian und Derivate (Darunter auch Ubuntu, Linux Mint, RasperryPI-OS, ...) reicht der Befehl

```sh
$ sudo apt-get install restic
```

Und schon ist Restic installiert!

### Resticprofile

> Mehr Details siehe [Installation](https://creativeprojects.github.io/resticprofile/installation/index.html)

Im Gegensatz zu Restic wird Resticprofile nicht als komplettes Programm installiert, sondern es handelt sich um eine Binary mit dem gesamten Code. Mittels eines Installationsskriptes wird die passende Version heruntergeladen und im Ordner `/bin` relativ zum aktuellen Pfad gespeichert:

```sh
$ curl -sfL https://raw.githubusercontent.com/creativeprojects/resticprofile/master/install.sh | sh
```

Da ich den `bin`-Ordner etwas verwirrend finde und die Executable lieber direkt neben meinen Konfigurationsdateien liegen habe, habe ich diese kurzerhand verschoben:

```sh
$ mv bin/resticprofile .
```

Nun können wir die Konfiguration starten!

## Konfiguration




[^1]: Restic unterstützt sehr viele Backends, eine Übersicht ist [hier](https://restic.readthedocs.io/en/stable/030_preparing_a_new_repo.html#) zu finden.

[^2]: Ein Beispiel: Um sich mit SFTP zu verbinden, müsste jedes mal der Connection String `restic -r sftp:user@host:/srv/restic-repo <command>` und das Repository Passwort eingegeben werden, was eine Automatisierung erschwert. Natürlich lassen sich auch Bash-Skripte dafür schreiben, aber es gibt auch eine bessere Möglichkeit!
