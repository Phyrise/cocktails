/** Propose le fichier au téléchargement (ou au partage sur iPhone quand c'est possible). */
export async function saveJsonFile(fileName: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
  const file = typeof File !== 'undefined' ? new File([blob], fileName, { type: 'application/json' }) : null;
  const nav = globalThis.navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  const isTouch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  if (isTouch && file && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: fileName });
      return;
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Ouvre le sélecteur de fichiers et renvoie le JSON choisi (ou null si annulé). */
export function pickJsonFile(): Promise<unknown | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';
    input.addEventListener('cancel', () => {
      input.remove();
      resolve(null);
    });
    input.onchange = async () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) return resolve(null);
      try {
        resolve(JSON.parse(await file.text()));
      } catch {
        reject(new Error('Ce fichier n’est pas un JSON valide.'));
      }
    };
    document.body.appendChild(input);
    input.click();
  });
}

/** Réduit une photo choisie par l'utilisateur (max 720 px, JPEG ~70 %) pour la garder légère. */
export async function compressImage(uri: string, maxSize = 720): Promise<string> {
  const image = new Image();
  image.src = uri;
  await image.decode();
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.72);
}
