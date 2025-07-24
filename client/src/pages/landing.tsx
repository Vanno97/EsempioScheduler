import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Mail, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Agenda Settimanale
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Organizza la tua settimana con facilità. Gestisci appuntamenti, imposta promemoria e mantieni tutto sotto controllo.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={() => window.location.href = '/api/login'}
          >
            Accedi per Iniziare
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
              <CardTitle>Vista Settimanale</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualizza tutti i tuoi appuntamenti in una chiara griglia settimanale
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 mx-auto text-green-600 dark:text-green-400 mb-4" />
              <CardTitle>Gestione Orari</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Posizionamento preciso degli appuntamenti con rilevamento conflitti
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Mail className="h-12 w-12 mx-auto text-orange-600 dark:text-orange-400 mb-4" />
              <CardTitle>Promemoria Email</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Ricevi notifiche email automatiche per non perdere mai un appuntamento
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto text-purple-600 dark:text-purple-400 mb-4" />
              <CardTitle>Dati Sicuri</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                I tuoi dati sono protetti e privati, accessibili solo a te
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Pronto per organizzare la tua settimana?
          </p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Inizia Ora
          </Button>
        </div>
      </div>
    </div>
  );
}