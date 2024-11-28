import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star } from "lucide-react";
import { ApiDefinition } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ApiListProps {
  apis: ApiDefinition[];
  selectedApi: string | null;
  onApiSelect: (apiId: string) => void;
}

const ApiList: React.FC<ApiListProps> = ({
  apis,
  selectedApi,
  onApiSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredApis = apis.filter((api) => {
    const matchesSearch =
      api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || api.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(apis.map((api) => api.category)));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="API Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm("");
            setSelectedCategory(null);
          }}
        >
          Filtreleri Temizle
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() =>
              setSelectedCategory(
                category === selectedCategory ? null : category
              )
            }
          >
            {category}
          </Badge>
        ))}
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid gap-4">
          {filteredApis.map((api) => (
            <Card
              key={api.id}
              className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                selectedApi === api.id ? "border-primary" : ""
              }`}
              onClick={() => onApiSelect(api.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{api.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {api.description}
                  </p>
                </div>
                {api.isFavorite && <Star className="h-4 w-4 text-yellow-500" />}
              </div>

              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{api.category}</Badge>
                {api.pricing && <Badge variant="outline">{api.pricing}</Badge>}
                {api.protocols.map((protocol) => (
                  <Badge key={protocol} variant="outline">
                    {protocol}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ApiList;
