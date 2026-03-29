import { connectDB } from '@/lib/mongodb'
import Category from '@/lib/models/Category'

const categories = [
  { name: 'Plombier',                    nameAr: 'سبّاك',                          slug: 'plombier',      icon: '🔧', description: 'Installation et réparation de plomberie' },
  { name: 'Menuisier',                   nameAr: 'نجّار',                          slug: 'menuisier',     icon: '🪚', description: 'Travaux de menuiserie et bois' },
  { name: 'Mécanicien',                  nameAr: 'ميكانيكي',                       slug: 'mecanicien',    icon: '🔩', description: 'Réparation et entretien automobile' },
  { name: 'Électricien',                 nameAr: 'كهربائي',                        slug: 'electricien',   icon: '⚡', description: 'Installation et réparation électrique' },
  { name: "Réparateur d'électroménager", nameAr: 'مُصلح أجهزة كهرومنزلية',         slug: 'electromenager',icon: '🏠', description: "Réparation d'appareils électroménagers" },
  { name: 'Peintre',                     nameAr: 'دهّان',                          slug: 'peintre',       icon: '🎨', description: 'Travaux de peinture intérieure et extérieure' },
  { name: 'Maçon',                       nameAr: 'بنّاء',                          slug: 'macon',         icon: '🧱', description: 'Travaux de maçonnerie et construction' },
  { name: 'Carreleur',                   nameAr: 'مُبلّط',                         slug: 'carreleur',     icon: '◻️', description: 'Pose de carrelage et revêtements de sol' },
  { name: 'Technicien climatisation',    nameAr: 'تقني مكيفات',                    slug: 'climatiseur',   icon: '❄️', description: 'Installation et entretien de climatiseurs' },
  { name: 'Serrurier',                   nameAr: 'حدّاد / قفّال',                 slug: 'serrurier',     icon: '🔑', description: 'Serrurerie et sécurité' },
]

export async function POST() {
  try {
    await connectDB()
    await Category.deleteMany({})
    await Category.insertMany(categories)
    return Response.json({ message: 'Catégories insérées', count: categories.length })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Erreur serveur', detail: String(err) }, { status: 500 })
  }
}
