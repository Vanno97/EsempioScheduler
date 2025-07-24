import { categories } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileText } from "lucide-react";

interface SidebarProps {
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
  onExportICS: () => void;
  onExportCSV: () => void;
  taskCounts: Record<string, number>;
}

export function Sidebar({
  selectedCategories,
  onCategoryToggle,
  onExportICS,
  onExportCSV,
  taskCounts
}: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden lg:block">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Categorie</h3>
          <div className="space-y-2">
            {categories.map(category => (
              <label key={category.id} className="flex items-center space-x-3 cursor-pointer">
                <Checkbox 
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => onCategoryToggle(category.id)}
                />
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-gray-700">{category.name}</span>
                <span className="text-xs text-gray-500 ml-auto">
                  ({taskCounts[category.id] || 0})
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Azioni Rapide</h3>
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportICS}
              className="w-full justify-start px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <Download className="h-4 w-4 mr-2" />
              Esporta come .ics
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportCSV}
              className="w-full justify-start px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <FileText className="h-4 w-4 mr-2" />
              Esporta come .csv
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
