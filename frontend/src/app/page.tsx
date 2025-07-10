"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bienvenue sur BudgetFlow</h1>
          <p className="text-xl text-gray-600 mb-8">Gérez votre budget personnel en toute simplicité</p>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Commencer</CardTitle>
              <CardDescription>Connectez-vous ou créez un compte pour accéder à votre tableau de bord</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/signup">Créer un compte</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Suivi des dépenses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Suivez facilement toutes vos dépenses et revenus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budgets personnalisés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Créez des budgets adaptés à vos besoins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rapports détaillés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Analysez vos habitudes financières</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
