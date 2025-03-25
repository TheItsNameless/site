---
Title: The Stash - Quick Fixes für Alles
tags:
  - how-to
  - server
  - quick-fixes
date: 2025-03-23
---

Manchmal treten die allermerkwürdigsten Fehler auf. Ob ein Timeout beim Upload von Fotos auf Immich, TODO

All diese kleinen Fehler mögen einem den Tag ruinieren, doch der Fix ist oft zu kurz um dafür einen eigenen Blogeintrag zu schreiben. Genau dafür gibt es diese Seite! Hier sammle ich alle kleinen Steinchen, über die ich gestolpert bin und zeige euch, wie ich sie beheben konnte.

# Traefik `502 Bad Gateway ... i/o timeout`

## Hintergrund

Services wie [Immich](https://immich.app/) und [Nextcloud](https://nextcloud.com) sind beliebte Tools, um Dateien zu sichern, zu organisieren und zu durchsuchen. Oftmals sind diese Dateien ziemlich groß (große Archivdateien, Videos, ...).

## Symptome

Möchte man diese Dateien nun hochladen, scheint der Upload zu funktionieren. Bis der Service einen Fehler wirft: der Upload war nicht erfolgreich. Zeitgleich erscheint in [Traefik](https://doc.traefik.io/traefik/) ein Fehler ähnlich zu

```sh
502 Bad Gateway error="readfrom tcp 172.19.0.2:54726->172.19.0.15:2283: i/o timeout"
```

# Ursache

Standardmäßig hat Traefik einen Timeout von **60 Sekunden**[^1]. Alle Requests, die länger dauern, werden terminiert. Somit können große Dateien nicht hochgeladen werden.

## Behebung

Das Problem lässt sich beheben, indem beim jeweiligen Traefik Entrypoint der Timeout entsprechend erhöht / entfernt wird:

```yml
...
entryPoints:
	...
    websecure:
        address: ':443'
        # \/ Fix \/
        transport:
            respondingTimeouts:
                readTimeout: '0s' # 0s deaktiviert den Timeout
        # /\ Fix /\
```

[^1]: [traefik respondingTimeouts](https://doc.traefik.io/traefik/routing/entrypoints/#respondingtimeouts) - Timeouts, die beim beantworten von Requests gesetzt sind. Standardmäßig sind das 60 Sekunden für das Lesen des Bodies.
