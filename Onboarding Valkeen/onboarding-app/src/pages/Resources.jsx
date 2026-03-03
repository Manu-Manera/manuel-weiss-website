import { useState } from 'react';
import { 
  ExternalLink, 
  Search, 
  Video, 
  FileText, 
  Globe,
  BookOpen,
  Filter
} from 'lucide-react';
import { resources } from '../data/onboardingData';

const typeIcons = {
  video: Video,
  docs: FileText,
  website: Globe,
  article: BookOpen
};

const typeColors = {
  video: 'text-red-400 bg-red-500/20',
  docs: 'text-blue-400 bg-blue-500/20',
  website: 'text-green-400 bg-green-500/20',
  article: 'text-amber-400 bg-amber-500/20'
};

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const categories = ['all', ...resources.map(r => r.category)];
  const types = ['all', 'video', 'docs', 'website', 'article'];

  const filteredResources = resources
    .filter(category => selectedCategory === 'all' || category.category === selectedCategory)
    .map(category => ({
      ...category,
      items: category.items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || item.type === selectedType;
        return matchesSearch && matchesType;
      })
    }))
    .filter(category => category.items.length > 0);

  const totalResources = resources.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ressourcen-Bibliothek</h1>
          <p className="text-white/60">{totalResources} Lernmaterialien verfügbar</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ressourcen durchsuchen..."
              className="glass-input pl-12"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {cat === 'all' ? 'Alle' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 mt-4">
          <Filter className="w-5 h-5 text-white/40" />
          {types.map(type => {
            const Icon = typeIcons[type];
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedType === type
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {type === 'all' ? 'Alle Typen' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="space-y-8">
        {filteredResources.map(category => (
          <div key={category.category}>
            <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((item, index) => {
                const Icon = typeIcons[item.type] || FileText;
                const colorClass = typeColors[item.type] || 'text-gray-400 bg-gray-500/20';
                
                return (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card p-5 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass.split(' ')[1]}`}>
                        <Icon className={`w-5 h-5 ${colorClass.split(' ')[0]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm mb-1 group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass.split(' ')[1]} ${colorClass.split(' ')[0]}`}>
                            {item.type}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        ))}

        {filteredResources.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/50">Keine Ressourcen gefunden</p>
            <p className="text-sm text-white/30 mt-1">Versuche andere Suchbegriffe oder Filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
