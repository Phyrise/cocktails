# Tester Arturo et Clémentine sur Android

## Le plus rapide : Expo Go, sans câble

1. Installer **Expo Go** depuis le Play Store sur le Pixel.
2. Mettre le Mac et le Pixel sur le même réseau Wi-Fi.
3. Dans le projet, lancer :

```bash
pnpm start
```

4. Scanner le QR code avec l'appareil photo du Pixel ou depuis Expo Go.
5. Garder le terminal ouvert pendant le test.

Cette méthode charge le projet depuis le Mac. Elle ne crée pas encore une application autonome. Si le réseau local bloque la connexion, essayer :

```bash
pnpm exec expo start --tunnel
```

## Installer une vraie application de développement par USB

Sur le Pixel, activer les **Options pour les développeurs**, puis le **Débogage USB**. Brancher le téléphone au Mac, accepter son autorisation et vérifier la connexion :

```bash
adb devices
pnpm exec expo run:android --device
```

Le premier build est plus long. Les changements JavaScript suivants peuvent ensuite être servis avec `pnpm start`.

## Générer un APK alpha partageable

Le profil `preview` de `eas.json` est déjà configuré pour produire un APK installable directement.

```bash
pnpm dlx eas-cli@latest login
pnpm dlx eas-cli@latest build -p android --profile preview
```

À la fin, Expo fournit un lien et un QR code. Ouvrir le lien sur le Pixel, télécharger l'APK, puis autoriser ponctuellement Chrome ou l'application Fichiers à **installer des applications inconnues**.

On peut aussi télécharger l'APK sur le Mac et l'installer par USB :

```bash
adb install -r /chemin/vers/arturo-et-clementine.apk
```

Le profil `production` servira plus tard à créer l'AAB destiné au Google Play Store.

## Et dans Chrome ?

`pnpm web` permet un aperçu navigateur. Depuis le Pixel, on peut ouvrir l'adresse réseau affichée par Expo, mais cela reste la version web. Pour juger l'interface Android native, préférer Expo Go, le build USB ou l'APK.
