---
Title: Blog aufsetzen leicht gemacht
tags:
  - how-to
  - server
date: 2025-07-20
---
*Jaja*, Services aufsetzen macht Spaß. Aber Moment mal, welche Services habe ich den nun eigentlich? Und wie sind sie erreichbar?

Die Übersicht über seine Services zu erhalten ist genau so wichtig wie aufwendig. Klar, die Browser-Autovervollständigung hilft einem da ganz schön, aber vergisst man mal die Subdomain dann beginnt die große Suche. Eine Übersicht muss her, am besten ein *simples Dashboard*.

Genau das macht [Homer](https://github.com/bastienwirtz/homer)!

# Ääh, Homer?

Der Name mag verwirrend sein, doch selbsterklärend ist er dazu: 

> *A dead simple static **HOM**epage for your serv**ER** to keep your services on hand, from a simple `yaml` configuration file.*

Dieses Tool erlaubt es, schnell ein Dashboard für verschiedene Services zu erstellen, um den Überblick zu behalten.

![[Homer Beispielbild.png]]

*Nicht wundern über die leeren Felder, für meine Privatsphäre habe ich diese geschwärzt.*

## Ja aber wie denn nun?

Der [Get Started](https://github.com/bastienwirtz/homer?tab=readme-ov-file#get-started)-Guide auf dem Repository ist sehr übersichtlich gestaltet und das Dashboard steht schnell. Möchte man nun seine eigenen Services hinzufügen, so folgt man einfach dem [Configuration](https://github.com/bastienwirtz/homer/blob/main/docs/configuration.md)-Guide.

Da das alles selbsterklärend ist, folgen nun ein paar Tipps und Tricks, damit auch du das meiste aus **Homer** herausholen kannst!

# Schneller Zugriff - Einfach per Neuer Tab

Der neue Tab ist ganz schnell geöffnet und zeigt - Google (*natürlich gibt es auch Bing, DuckDuckGo, ...*). Das mag für viele reichen, aber wir sind *Power User*. Wie schön wäre es, wenn wir unser Dashboard direkt dort sehen?

Auch dafür gibt es *natürlich* eine [Anleitung](https://github.com/bastienwirtz/homer/blob/main/docs/tips-and-tricks.md#use-homer-as-a-custom-new-tab-page) von Homer! Leider hat diese bei mir ständig zu einem Fehler geführt, wenn ich auf die Links im Dashboard geklickt habe:

![[Firefox iFrame Fehler.png]]

## Firefox - Warum nur?

Das von **Homer** vorgeschlagene Firefox-AddOn[^1] nutzt `iFrames`[^2] um die Services auf unserem Dashboard im gleichen Tab anzuzeigen. Dies erlaubt uns, die Suchleiste unseres Browsers einfach zu und so schnell Suchen zu machen.

Da `iFrames` aber auch zu bösen Zwecken missbraucht werden können[^3] erlauben viele Webseiten es nicht, einfach überall eingebettet zu werden. Somit blockiert Firefox den Aufruf.

Dies erreicht eine Webseite, indem diese einen Header `x-frame-options: DENY` mitsendet, und somit das Einbetten auf jeglichen anderen Webseiten verbietet. Um das Einbetten auf bestimmten Webseiten zu erlauben, müssen jedoch folgende Header mitgeschickt werden:

```
customFrameOptionsValue: "ALLOW-FROM <origin>"
contentSecurityPolicy: "frame-ancestors 'self' <origin>"
```

## Welche Website muss ich nehmen?

Jetzt kommt die große Frage: Welche Webseite versucht den nun, unsere Services einzubetten?

Da unser Browser-AddOn diese Seite einbettet, benötigen wir dessen URL als Origin. Um diese herauszufinden öffnen wir einen neuen Tab, dann die Konsole des Browsers und geben dort den Befehl ein:

```js
console.log(window.location.origin);
```

Als Antwort erhalten wir eine URL, welche dem folgenden Format entspricht:

```
moz-extension://<guid>
```

Diese URL können wir jetzt an Stelle von `<origin>` einsetzen.

## Ein Fix für Traefik

Wer auch [Traefik](https://doc.traefik.io/traefik/) nutzt kann diese Header nun einfach für alle Services setzen. Dafür erstelle man eine Middleware[^4] in seiner `dynamic.yml` und fügt folgende Informationen ein:

```yml
http:
    middlewares:
		iframe-allow-dashboard:
            headers:
                customFrameOptionsValue: "ALLOW-FROM <origin>"
                contentSecurityPolicy: "frame-ancestors 'self' <origin>"
```

Diese Middleware kann nun standardmäßig für alle Services im passenden `entryPoint`[^5] in der `static.yml` hinzugefügt werden:

```yml
entryPoints:
    websecure:
        address: ':443'
        http:
            middlewares:
                - iframe-allow-dashboard@file
```

Nach einem Neustart sollten alle Services die passenden Header gesetzt haben und über **Homer** funktionieren!

## Und was ist mit anderen Webseiten?

So schön dieser Fix auch ist, uns ist es nicht möglich einfach den Quellcode anderer Webseiten zu bearbeiten um diese Header zu setzen.

Um nun aber auch fremde Seiten in **Homer** anzuzeigen und diese über einen Neuen Tab öffnen zu können, müssen wir sagen, dass Firefox diese in einem neuen Tab öffnen soll. Dies kann durch die Konfiguration `target="_blank"` erreicht werden:

```yml
services:
  - name: "General"
    icon: "fas fa-star"
    items:
      - name: "Externe Webseite"
        logo: "assets/tools/logo.png"
        url: "https://beispiel.de/"
        target: "_blank"
```

Ein Klick und schon ist die Webseite in einem neuen Tab geöffnet!

# Ping für Alle

Wer sich mit **Homer** auseinandergesetzt hat, sollte die [Ping Smart Card](https://github.com/bastienwirtz/homer/blob/main/docs/customservices.md#ping) kennen. Mit dieser lässt sich einfach anzeigen, ob Services online sind.

![[YAML Anchor Example.png]]

Um die selbe Config nicht ständig bei jedem Service neu hinzufügen zu müssen, können YAML Anchors[^6] verwendet werden. Man definiert einen Anchor zu Beginn und nutzt diesen bei allen Services, die `Ping` nutzen sollen:

*Definition:*
```yml
anchors:
  Ping: &Ping  # Hinter dem & den Namen des Anchors definieren
    - type: "Ping"
      successCodes: [200, 301, 302, 401]
```

*Nutzung:*
```yml
services:
  - name: "General"
    icon: "fas fa-star"
    items:
      - name: "Authelia SSO"
        logo: "assets/tools/authelia.png"
        url: "https://authelia.yourdomain.com"
        <<: *Ping  # Mit dem Namen alle Attribute des Anchors einfügen
```

# Schlusswort

Ordnung kann so einfach sein, man muss es nur wollen! Mit **Homer** ist Ordnung ein Kinderspiel. Ich hoffe, ich habe euch überzeugt euch selbst ein Bild zu machen und euren Alltag mit **Homer** zu erleichtern. Bis nächstes mal!

[^1]: [Firefox Custom-New-Tab-Page](https://addons.mozilla.org/firefox/addon/custom-new-tab-page)

[^2]: [\<iframe\>: Das Inline-Frame-Element - HTML | MDN](https://developer.mozilla.org/de/docs/Web/HTML/Reference/Elements/iframe)

[^3]: [Why are iframes considered dangerous and a security risk? | Stackoverflow](https://stackoverflow.com/questions/7289139/why-are-iframes-considered-dangerous-and-a-security-risk)

[^4]: [Traefik Middleware](https://doc.traefik.io/traefik/middlewares/overview/) - Middlewares erlauben es, bestimmte Operationen an den Requests und Responses vorzunehmen, um zum Beispiel Authorisation hinzuzufügen oder Header zu bearbeiten.

[^5]: [Traefik EntryPoints](https://doc.traefik.io/traefik/routing/entrypoints/) - Ein EntryPoint sagen Traefik, auf welchem Port und mit welchem Protokoll Anfragen entgegengenommen werden sollen.

[^6]: [Don’t Repeat Yourself with Anchors, Aliases and Extensions in Docker Compose Files | by King Chung Huang | Medium](https://medium.com/@kinghuang/docker-compose-anchors-aliases-extensions-a1e4105d70bd)
