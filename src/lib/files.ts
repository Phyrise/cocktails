// Versions natives : l'échange de fichiers n'est disponible que dans la web app pour l'instant.
export async function saveJsonFile(_fileName: string, _data: unknown): Promise<void> {
  throw new Error('L’export de fichier est disponible dans la version web.');
}

export async function pickJsonFile(): Promise<unknown | null> {
  throw new Error('L’import de fichier est disponible dans la version web.');
}

export async function compressImage(uri: string): Promise<string> {
  return uri;
}
