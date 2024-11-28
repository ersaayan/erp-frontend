import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { ApiDefinition } from "./types";

interface ApiComparisonProps {
  apis: ApiDefinition[];
}

const ApiComparison: React.FC<ApiComparisonProps> = ({ apis }) => {
  const features = Array.from(
    new Set(apis.flatMap((api) => api.features))
  ).sort();

  const protocols = Array.from(
    new Set(apis.flatMap((api) => api.protocols))
  ).sort();

  const formats = Array.from(
    new Set(apis.flatMap((api) => api.formats))
  ).sort();

  return (
    <div className="space-y-8">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Özellik</TableHead>
            {apis.map((api) => (
              <TableHead key={api.id}>{api.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Kategori</TableCell>
            {apis.map((api) => (
              <TableCell key={api.id}>
                <Badge variant="outline">{api.category}</Badge>
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Fiyatlandırma</TableCell>
            {apis.map((api) => (
              <TableCell key={api.id}>{api.pricing || "Ücretsiz"}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Kimlik Doğrulama</TableCell>
            {apis.map((api) => (
              <TableCell key={api.id}>{api.authentication.type}</TableCell>
            ))}
          </TableRow>
          {features.map((feature) => (
            <TableRow key={feature}>
              <TableCell className="font-medium">{feature}</TableCell>
              {apis.map((api) => (
                <TableCell key={api.id}>
                  {api.features.includes(feature) ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-medium">Protokoller</TableCell>
            {apis.map((api) => (
              <TableCell key={api.id}>
                <div className="flex flex-wrap gap-1">
                  {api.protocols.map((protocol) => (
                    <Badge key={protocol} variant="secondary">
                      {protocol}
                    </Badge>
                  ))}
                </div>
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Veri Formatları</TableCell>
            {apis.map((api) => (
              <TableCell key={api.id}>
                <div className="flex flex-wrap gap-1">
                  {api.formats.map((format) => (
                    <Badge key={format} variant="outline">
                      {format}
                    </Badge>
                  ))}
                </div>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default ApiComparison;
