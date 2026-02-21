import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  filters?: { label: string; value: string; options: FilterOption[]; onChange: (v: string) => void }[];
}

export function FilterBar({ searchValue, onSearch, searchPlaceholder = 'Search...', filters }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-10 bg-secondary border-border"
        />
      </div>
      {filters?.map((f) => (
        <Select key={f.label} value={f.value} onValueChange={f.onChange}>
          <SelectTrigger className="w-[160px] bg-secondary border-border">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-muted-foreground shrink-0" />
            <SelectValue placeholder={`All ${f.label}`} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {f.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
