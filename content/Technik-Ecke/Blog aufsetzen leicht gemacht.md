---
Title: Blog aufsetzen leicht gemacht
tags:
  - how-to
  - server
  - blogging
---


*Puh...*, da hat man sich mal entschieden, einen Blog zu schreiben, aber hat absolut keinen Plan, wo man anfängt... doch damit ist jetzt Schluss, mit dem Nameless-Blog-Tutorial! Kommt mit mir auf eine Reise durch die weite Welt der Blogging-Tools, Webseiten und, *ja*, deutschem Recht!

# Die Idee - Wozu schreibt man einen Blog?

Um überhaupt einen Blog schreiben zu wollen, braucht man zunächst eine *Idee*.

Als ich began, meinen Raspberry Pi aufzusetzen, hatte ich recht wenig Erfahrung mit solchen Angelegenheiten. 

*Wie installiere ich Container? Wie richtet man SSL ein? Wie kann ich meine Dienste von überall aus erreichen?*

Ich stellte mir viele solcher Fragen. Schnell waren Antworten gefunden (*wozu gibt es sonst das Internet*), doch genau so schnellen traten Fehler auf, wozu ich *keine* direkte Antwort fand. So began eine oft gefühlt unendlich lange Suche nach der Lösung, die *glücklicherweise* schlussendlich doch in einem Erfolg endete. Geholfen haben dabei vor allem Blogs (Shout-out an [digital cleaning](https://digital-cleaning.de/)), die einem Tipps und Lösungen gaben. Leider sind diese Infos sehr verteilt und nicht gerade strukturiert - eine Sammlung musste her.

Ich entschied mich, meine Abenteuer, ebenso wie andere Blogger, mit der Welt zu teilen und so anderen dabei zu helfen, ähnliche Probleme wie ich habe zu lösen. Vielleicht stellst du dir gerade die selben Fragen, wie ich sie mir stellte und vielleicht helfen dir meine Posts, ähnliche Probleme zu lösen.

# Die Umsetzung - Wie schreibe ich nun einen Blog?

Die Idee war geboren - jetzt folgt die Umsetzung. Da ich bereits einen Server habe <!-- Link zum Artikel --> und [Obsidian](https://obsidian.md/) für alle meinen Notizen nutze - welcher einen sehr hübschen, aber teuren [publish](https://obsidian.md/publish) Service hat - wollte ich eine selbstgehostete Alternative dazu nutzen.

Nach einer recht kurzen Suche stieß ich auf einen interessanten [Reddit Post](https://www.reddit.com/r/ObsidianMD/comments/16e5jek/best_way_to_selfhost_obsidian_publish/), der genau diese Frage beantworten sollte. Mein Tool der Wahl wurde also [Quartz](https://quartz.jzhao.xyz/), ein sehr schöner SSG[^1], der sehr nah an Obsidian Publish ist - sowohl im Design als auch im Featureumfang.


# Quartz Setup - Die Basics

Quartz ist recht einfach zu nutzen, eine detailierte Anleitung ist [in der Dokumentation](https://quartz.jzhao.xyz/) zu finden. Man cloned das [Git-Repository](https://github.com/jackyzha0/quartz.git), initialisiert ein npm-Projekt mit `npm init` und kann sich seine Inhalte mittels `npx quartz build --serve` lokal anschauen. Die fertige Seite lässt sich einfach mittels einem eigenen Git-Repository teilen und mittels einer [Anleitung](https://quartz.jzhao.xyz/hosting) kann man auf bekannten Seiten, wie Cloudflare oder Github Pages seine Seite hosten.

Ich habe nun aber einen eigenen Server. Und das Prinzip, das gesamte Quartz-Repository mittels Git zu syncen gefällt mir garnicht. Ich hätte gerne ein strukturiertes Repository, mit den Config-Dateien und den Seiten, welches automatisch in statische HTML-Seiten gebaut wird und so einfach gehostet werden kann. Wie gut, dass wir Ahnung von Computern haben!

# Link Magic - Eine Prise Perfektion

## Ein strukturiertes Git-Repository

Das Prinzip, immer das gesamte Quartz-Repository zu Clonen führt zu ziemlich viel Bloat, wenn man einfach seine Website mittels Git synchronisieren möchte. Tatsächlich sind die einzigen Dateien, die man selber anfassen muss:

- die Markdown-Seiten in `quartz/content`
- und die Konfigurationsdateien in `quartz/.config`

*Zwei Ordner? Mehr nicht?* - Ja, mehr nicht. Der Rest ist Krams den Quartz zum bauen deiner Seite benötigt. Zum Aufräumen und lokalem Testen reicht es also, einen extra Ordner zu erstellen und dort einfach diese beiden Ordner zu kopieren. Ich habe dann ein eigenes Git-Repository erstellt, diese Ordner dort hinein verschoben und mittels **Symbolic Links**[^2] mit den Ordnern im eigentlichen Quartz-Ordner verknüpft.

### Mein Ordnersystem

```yml
quartz
	content     # Hier liegen die .md Dateien zum bauen
	.config     # Hier liegen die entsprechenden Configs
	...         # Weitere, uninteressante Dateien
	repository  # Mein neuer Ordner, den ich auf Git synce
		content # Verlinkung von quartz/content
		.config # Verlinkung von quartz/.config
		...     # Weitere Repository-Config-Dateien
```

### Befehle zum Erstellen der Links

```sh
ln -sf /path/to/repository/content .
# Verlinkt den /repository/content Ordner mit einem content Ordner im aktuellen Pfad
# -s : Symoblic Link
# -f : Überschreibe einen eventuell existierenden content Ordner im aktuellen Pfad
```

```sh
ln -sf /path/to/repository/.config .
```

Nun lässt sich das Git-Repository auf eine Git-Platform wie GitHub pushen - et voilà - ein übersichtliches Repository!

## Der Weg zum Auto Build

Jetzt soll der Blog bei jedem Push automatisch gebaut werden. Dafür müssen natürlich die fehlenden Quartz-Dateien wieder eingefügt werden, und die gebauten HTML-Dateien auf eine eigene Branch gepusht werden. Genau dafür gibt es [GitHub Actions](https://github.com/features/actions)!

Die Action musste also **bei jedem Push auf main** laufen, die **Seiten bauen** und **auf die publish Branch pushen**. Wer noch nie GitHub Actions genutzt hat, dem gebe ich hier eine kurze Erklärung meines Scripts:

```yml
name: Deploy Quartz Site                  # Der Name des Skripts

on:                                       # Wann wird dieses Skript ausgeführt?
  push:                                   # Wenn auf main gepusht wird
    branches:
      - main

jobs:                                     # Dann führe die folgenden Aufgaben aus
  deploy:                                 # Name der Aufgabe ist "deploy"
    runs-on: ubuntu-latest
    permissions:
        contents: write
    steps:
      - name: Checkout current repository # Klone dieses Repository in den Ordner "content-repo"
        uses: actions/checkout@v4
        with:
          path: content-repo

      - name: Setup Node.js                # Setze Node.js mit Version 20 auf
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Clone Quartz                 # Klone das Quartz Repository und installiere die Dependencies
        run: |
          git clone https://github.com/jackyzha0/quartz.git
          cd quartz
          npm install
          
      - name: Copy content                  # Kopiere den Content aus dem content-repo in das build-repo
        run: |
          rm -rf quartz/content/
          mkdir -p quartz/content/
          cp -r content-repo/content/* quartz/content/

      - name: Copy config                    # Kopiere auch die Config
        run: |
          cp -r content-repo/.config/* quartz/

      - name: Build site                     # Baue die HTML-Seiten
        run: |
          cd quartz
          npx quartz build

      - name: Push to publish branch         # Commite und pushe die gebauten Seiten in "quartz/public" als github-actions Nutzer auf die "publish" Branch
        run: |
          git config --global user.name 'github-actions[bot]'
          git config --global user.email 'github-actions[bot]@users.noreply.github.com'
          cd quartz/public
          git init
          git add -A
          git commit -m "Deploy built site"
          git push -f "https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }}.git" HEAD:publish
```

Wenn dieses Skript nun im Repository unter `.github/workflows/build.yml` abgelegt wird, wird automatisch bei jedem Push auf main das Projekt gebaut und in die Branch `publish` veröffentich. Diese statische Seite kann ganz einfach auf einem Server, mit GitHub Pages oder was es sonst noch gibt veröffentlicht werden!

# Deutsches Recht - Bitte was?

*Der nachfolgende Abschnitt ist keine rechtliche Beratung. Bei konkreten Fragen sollte stets ein Anwalt konsultiert werden.*

*Fun Fact* - Tatsächlich kann nicht jeder einfach so eine Website im Internet veröffentlichen, ohne dafür verantwortlich zu sein. Deshalb schreibt das Deutsche Recht einige Bedingungen vor, um eine Website, zum Beispiel einen Blog, zu veröffentlichen. Nicht jeder kann sich einigen, was man genau beachten muss, welche Gesetze nun wirklich auf einen zutreffen und wie detailiert diese Angaben sein müssen.

All das klingt erstmal komplizierter als es ist. Ich fasse hier einmal kurz einige Dinge zusammen, die ich für sehr wichtig halte:

## Impressumspflicht

Nach dem [§5 des Digitale-Dienste-Gesetz](https://www.gesetze-im-internet.de/ddg/__5.html) hat jeder Betreiber einer *in der Regel gegen Entgelt* angebotenen Webseite gewisse Kontaktinformationen bereitzustellen. Was ist *in der Regel*? Zählt mein Blog dazu, der vielleicht irgendwann mal Werbung schaltet?

Unabhängig davon, will man auf Nummer sicher gehen. Deshalb - Impressum. Dazu gehören:

- Name und Anschrift des Betreibers
- Angaben für eine *schnelle*[^3] elektronische Kontaktaufnahme
- weitere Informationen, sollte der Dienst beruflich / von einer juristischen Person angeboten werden

Wer seine Privatsphäre nicht völlig preisgeben möchte, der kann auch hier einige Kniffe anwenden: Als Adresse zählt jede *ladungsfähige* Adresse, über die man direkt postalisch erreicht werden kann. Das darf zwar kein Postfach sein, in das man nicht regelmäßig hineinschaut, muss aber auch nicht deine private Hausanschrift sein. Ich entschied mich für einen sogenannten **Impressumsservice**[^4]. Nach langer Recherche und Kostenabwägung stieß ich auf [autorenservices](https://www.autorenservices.de/impressums-service/fuer-webseiten-4-jahre.html#), welche für knapp 30€ für vier Jahre eine Adresse zur Verfügung stellen, welche man in seinem Impressum nutzen kann. Da ich keine zu großen Postmengen erwarte, ist dieser Service genau richtig für mich!

## Datenschutz

Jeder Dienstanbieter, der Daten verarbeitet, muss nach der [DSGVO](https://eur-lex.europa.eu/eli/reg/2016/679/oj/deu?locale=de) Informationen über eben jene Verarbeitung bereitstellen.

Blogs werden zumeist im Internet gehostet, und dort laufen die Daten über einen Dienstanbieter. In meinem Fall ist das [Ionos](https://www.ionos.de/), und ja, die verarbeiten Daten!

Da ich nicht gerade viel Zeit und Lust habe, eine eigene Datenschutzerklärung zu schreiben, nahm ich mir den [eRecht24 Datenschutz-Generator](https://www.e-recht24.de/muster-datenschutzerklaerung.html) zur Hand und in wenigen Minuten hatte ich eine *hoffentlich* ausreichende Datenschutzerklärung parat!

## Urheberrecht

Wer sich die Mühe macht, Inhalte zu veröffentlichen, sollte anderen auch mitteilen, wie diese zu verwenden sind. Dafür gibt es sehr viele Lizenzmodelle, die alle verschiedenstes erlauben. Der [creative commons license chooser](https://chooser-beta.creativecommons.org/) ist ein sehr hilfreiches Tool, um die passende Lizenz zu finden. Ich entschied mich für **CC BY-NC-ND**:

- BY: Der Autor muss stets erwähnt werden
- NC: Die Inhalte dürfen nicht (ohne ausdrückliche Erlaubnis) für kommerzielle Zwecke genutzt werden
- ND: Die Inhalte dürfen nicht (ohne ausdrückliche Kennzeichnung) modifiziert werden

Jedem steht natürlich frei seine Werke anders zu lizenzieren.

# Outro

So, ich hoffe ihr habt einen recht ausführlichen Einblick in die Welt der Blogs erhalten. Vielleicht habt ihr euch die Mühe gemacht, einen eigenen Blog aufzusetzen und euer Wissen mit der Welt zu teilen. Und falls nicht, dann hoffe ich, dass ihr zumindest viel Spaß beim lesen meines ersten Blogeintrags hattet!

Wie dem auch sei, bis zum nächsten Mal!

[^1]: [Static Site Generator](https://en.wikipedia.org/wiki/Static_site_generator) - Tool, dass aus simpel formatierten Dokumenten (z.B. Markdown) schöne HTML-Seiten erstellt.
[^2]: [Symbolische Verknüpfung](https://de.wikipedia.org/wiki/Symbolische_Verkn%C3%BCpfung) - Verlinkung zweier Dateien / Ordner, damit die Inhalte einfach synchronisiert werden können, ohne sie ständig manuell zu kopieren.

[^3]: Schnell? Heißt das E-Mail, Telefon, vielleicht ein Kontaktformular? Auch das ist Auslegungssache, aber zum Schutz der Privatsphäre verzichte ich auf eine Telefonnummer, da ich regelmäßig meine E-Mails kontrolliere.

[^4]: Ein Dienst, der eine ladungsfähige Adresse zur Verfügung stellt und eventuelle Post gegen eine geringe Gebühr an dich weiterleitet.
