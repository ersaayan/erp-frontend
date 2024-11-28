import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiDefinition } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ApiDetailsProps {
  api: ApiDefinition | undefined;
}

const ApiDetails: React.FC<ApiDetailsProps> = ({ api }) => {
  if (!api) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Lütfen detaylarını görmek istediğiniz API'yi seçin.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{api.name}</h2>
          <p className="text-muted-foreground">{api.description}</p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoint'ler</TabsTrigger>
            <TabsTrigger value="authentication">Kimlik Doğrulama</TabsTrigger>
            <TabsTrigger value="errors">Hata Kodları</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Özellikler</h3>
                  <div className="flex flex-wrap gap-2">
                    {api.features.map((feature) => (
                      <Badge key={feature} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Desteklenen Formatlar
                  </h3>
                  <div className="flex gap-2">
                    {api.formats.map((format) => (
                      <Badge key={format} variant="outline">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>

                {api.pricing && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Fiyatlandırma
                    </h3>
                    <p>{api.pricing}</p>
                  </div>
                )}

                {api.limits && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Kullanım Limitleri
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {Object.entries(api.limits).map(([key, value]) => (
                        <li key={key}>
                          {key}: {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints">
            <Card className="p-6">
              <div className="space-y-6">
                {api.endpoints.map((endpoint) => (
                  <div
                    key={endpoint.path}
                    className="border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{endpoint.method}</Badge>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {endpoint.description}
                    </p>
                    {endpoint.parameters && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">
                          Parametreler:
                        </h4>
                        <ul className="list-disc pl-5 text-sm">
                          {endpoint.parameters.map((param) => (
                            <li key={param.name}>
                              <code>{param.name}</code> ({param.type}) -{" "}
                              {param.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="authentication">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Kimlik Doğrulama</h3>
                <p>{api.authentication.description}</p>
                {api.authentication.steps && (
                  <div>
                    <h4 className="font-semibold mb-2">Adımlar:</h4>
                    <ol className="list-decimal pl-5 space-y-2">
                      {api.authentication.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="errors">
            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Hata Kodları</h3>
                <div className="grid gap-4">
                  {api.errors.map((error) => (
                    <div
                      key={error.code}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">{error.code}</Badge>
                        <span className="font-semibold">{error.message}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {error.description}
                      </p>
                      {error.solution && (
                        <p className="text-sm">
                          <span className="font-semibold">Çözüm:</span>{" "}
                          {error.solution}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default ApiDetails;
