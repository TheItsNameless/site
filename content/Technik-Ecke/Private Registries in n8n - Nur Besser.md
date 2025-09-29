---
Title: Private Registries in n8n - Nur Besser
tags:
    - how-to
    - server
    - automation
    - n8n
date: 2025-08-24
---

Nicht selten kommt es vor, dass man Prozesse ständig wiederholt. Ob alte E-Mails löschen, sich seine Werbemails zusammenfassen zu lassen, oder vieles weitere. Das alles lässt sich einfach automatisieren. Ein bekanntes Tool ist [n8n](https://n8n.io/), welches eine Vielzahl von integrierten und Community-Nodes hat. Doch manche Use-Cases sind einfach zu speziell und benötigen eigene Nodes.

# n8n-Customization leicht gemacht - Community Nodes

## Der offizielle Weg

[Community Nodes](https://docs.n8n.io/integrations/community-nodes/installation/) sind eine Möglichkeit, mit Typescript einfach eigene Nodes zu erstellen und so die Funktionalität von n8n zu erweitern. Um eigene Nodes zu publishen bietet n8n einen [Guide](https://docs.n8n.io/integrations/community-nodes/build-community-nodes). Dieser bietet zwei Möglichkeiten, Custom n8n-Nodes zu installieren:

-   auf npm[^1] veröffentlichen und approven lassen
-   in das Docker-Image kopieren und bauen

## Die Nachteile der offiziellen Wege

Beide Möglichkeiten sind eher beschränkt nützlich für private Nodes, da diese:

-   eine Veröffentlichung erfordern oder
-   das Image ständig automatisiert neu gebaut werden muss

Wie gut, dass wir uns mit npm auskennen!

# Die Lösung - n8n-Nodes aus privaten Quellen

## Was sind Private Registries?

Neben npm gibt es noch andere Registries, zum Beispiel die [GitHub npm Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry). Diese erlaubt das Veröffentlichen privater Pakete. Wie das funktioniert, ist in der [offiziellen Dokumentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#publishing-a-package-using-a-local-npmrc-file) zu finden, doch das soll hier keine Rolle spielen. Haben wir aber dann unsere Pakete veröffentlicht, wollen wir diese nun in n8n installieren können, und zwar ganz einfach über das Frontend.

## Wie nutze ich Private Registries?

npm nutzt die [.npmrc-Datei](https://docs.npmjs.com/cli/v9/configuring-npm/npmrc) um andere Registries zusätzlich zu der Standard-Reqistry zu verwalten. Da n8n einfach nur npm nutzt um die Community-Nodes zu installieren, muss ausschließlich eine `.npmrc` an die passende Stelle abgelegt werden. Nodes werden im Ordner `<n8n-Ordner>/nodes` abgelegt. Bewegt man sich auf einer laufenden n8n-Instanz dort hinein und führt `npm list` aus, erhält man eine Liste aller in n8n installierten Pakete - inklusive der Community-Nodes.

![[n8n Nodes npm list.png]]

Genau an diesem Ort kann jetzt also eine `.npmrc`-Datei mit einer Referenz und einem Access-Key auf die Private Registry abgelegt werden. Im Fall einer privaten GitHub Registry sieht das wie folgt aus:

_.npmrc:_

```npmrc
@theitsnameless:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=<github-personal-access-token>
```

Die erste Zeile beinhaltet den Paket-Namespace, um die Pakete dieser Quelle zu identifizieren. Da ich meine Pakete im Namespace `@theitsnameless` pushe, ist das der Namespace. Entsprechend wird die Einstellung `registry` auf die URL von GitHub gesetzt.

Die zweite Zeile autorisiert npm, auf diese Registry zugreifen zu können, indem ein PAT[^2] geliefert wird.

Diese Datei wird nun in der n8n-Instanz (zum Beispiel einem Docker-Volume) an folgender Stelle abgelegt:

```bash
.n8n
├── ...
└── nodes
    ├── node_modules
    │   └── ...
    ├── .npmrc            # <-- .npmrc HIER ablegen
    ├── package-lock.json
    └── package.json
```

## Wie installiere ich nun mein Paket?

In n8n unter `Settings > Community Nodes > Install` können nun Nodes hinzugefügt werden:

![[n8n Nodes Settings.png]]

Dann das Paket inklusive Namespace installieren:

![[n8n Nodes Installation.png]]

Und die Nodes hinzufügen:

![[n8n Nodes Example.png]]

Und Tada - Das Paket ist installiert! Nun lassen sich jederzeit neue Pakete hinzufügen und installieren, ohne dass diese approved oder das Image ständig neu gebaut werden muss!

[^1]: [Node Package Manager](https://www.npmjs.com/): Ein Paketmanager für Node
[^2]: [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens): Auth-Token, um sich ohne Passwort und 2FA für bestimmte GitHub-Dienste zu authentifizieren.
