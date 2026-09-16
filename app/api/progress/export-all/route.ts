// V77.1 · CP2 — ARCHIVE COMPLÈTE DES DONNÉES DE L'APPRENANT.
// GET /api/progress/export-all
//
// POURQUOI UNE SECONDE ROUTE, ET PAS UN CHAMP DE PLUS DANS LA SAUVEGARDE :
//
// `/api/progress/export` produit une SAUVEGARDE RESTAURABLE — un format que
// `/api/progress/import` sait relire et valider strictement. Y verser les
// journaux de tentatives aurait mélangé deux besoins : « je veux pouvoir
// revenir en arrière » et « je veux emporter tout ce qui est à moi ».
//
// Le CP0 a mesuré que l'interface promettait « toutes tes données locales » sur
// la première. C'était faux : le code de l'apprenant n'y est pas. Cette route
// rend cette phrase vraie, et l'autre reprend son nom exact.
import { NextResponse } from 'next/server';
import { readProgressV3 } from '@/lib/progress-server';
import { listExercises } from '@/lib/exercises-server';
import { exportAllWorkspaces } from '@/lib/workspace-server';
import { tousLesJournaux, instantaneDeSecours } from '@/lib/learner-data-server';
import { serializeBackupV3 } from '@/lib/backup';
import { CATEGORIES_DONNEES_APPRENANT, VERSION_ARCHIVE_COMPLETE } from '@/lib/learner-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date();
  const sauvegarde = serializeBackupV3(readProgressV3(), exportAllWorkspaces(listExercises()), now);
  const archive = {
    app: 'ai-career-os',
    kind: 'archive-complete',
    archiveSchemaVersion: VERSION_ARCHIVE_COMPLETE,
    exportedAt: now.toISOString(),
    // La liste des catégories vient de la SOURCE, pas d'une recopie : si une
    // catégorie de donnée apparaît un jour sans être ajoutée ici, l'écart est
    // visible dans le fichier lui-même.
    categories: CATEGORIES_DONNEES_APPRENANT.map((c) => ({ id: c.id, libelle: c.libelle, present: c.archiveComplete })),
    sauvegardeRestaurable: sauvegarde,
    journauxDeTentatives: tousLesJournaux(),
    instantaneDeSecours: instantaneDeSecours(),
  };
  const date = now.toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(archive, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="ai-career-os-archive-complete-${date}.json"`,
    },
  });
}
