export interface Product {
  id: string;
  name: string;
  categorySlug: string;
  price: number;
  image: string;
  team: string;
  sizes: string[];
  description: string;
  badge?: string;
}

export const products: Product[] = [
  // Tailandesa Torcedor
  { id: "p1", name: "Camisa Flamengo I 2024", categorySlug: "tailandesa-torcedor", price: 179.90, image: "https://images.unsplash.com/photo-1577212017308-80b53819444b?w=400&h=500&fit=crop", team: "Flamengo", sizes: ["P","M","G","GG","XGG"], description: "Camisa tailandesa torcedor do Flamengo temporada 2024.", badge: "Mais Vendida" },
  { id: "p2", name: "Camisa Corinthians I 2024", categorySlug: "tailandesa-torcedor", price: 169.90, image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=500&fit=crop", team: "Corinthians", sizes: ["P","M","G","GG","XGG"], description: "Camisa tailandesa torcedor do Corinthians." },
  { id: "p3", name: "Camisa Real Madrid I 2024", categorySlug: "tailandesa-torcedor", price: 189.90, image: "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=400&h=500&fit=crop", team: "Real Madrid", sizes: ["P","M","G","GG","XGG"], description: "Camisa tailandesa torcedor do Real Madrid.", badge: "Lançamento" },
  { id: "p4", name: "Camisa Barcelona I 2024", categorySlug: "tailandesa-torcedor", price: 189.90, image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=500&fit=crop", team: "Barcelona", sizes: ["P","M","G","GG","XGG"], description: "Camisa tailandesa torcedor do Barcelona." },
  // Retrô
  { id: "p5", name: "Camisa Brasil 1970 Retrô", categorySlug: "retro-tailandesas", price: 259.90, image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=500&fit=crop", team: "Brasil", sizes: ["P","M","G","GG","XGG"], description: "Camisa retrô da seleção brasileira de 1970. Um clássico eterno.", badge: "Clássico" },
  { id: "p6", name: "Camisa Santos 1962 Retrô", categorySlug: "retro-tailandesas", price: 249.90, image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=500&fit=crop", team: "Santos", sizes: ["P","M","G","GG","XGG"], description: "Camisa retrô do Santos FC da era Pelé." },
  // Nacionais Premium
  { id: "p7", name: "Camisa Palmeiras Nacional", categorySlug: "nacionais-premium", price: 89.90, image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=500&fit=crop", team: "Palmeiras", sizes: ["P","M","G","GG","XGG"], description: "Camisa nacional premium do Palmeiras." },
  { id: "p8", name: "Camisa São Paulo Nacional", categorySlug: "nacionais-premium", price: 79.90, image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400&h=500&fit=crop", team: "São Paulo", sizes: ["P","M","G","GG","XGG"], description: "Camisa nacional premium do São Paulo FC." },
  // DTF
  { id: "p9", name: "Camiseta Flamengo DTF", categorySlug: "camisetas-dtf", price: 99.90, image: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=500&fit=crop", team: "Flamengo", sizes: ["P","M","G","GG","XGG"], description: "Camiseta com estampa DTF do Flamengo." },
  // Bonés
  { id: "p10", name: "Boné Flamengo Premium", categorySlug: "bones-premium", price: 59.90, image: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=500&fit=crop", team: "Flamengo", sizes: ["Único"], description: "Boné premium bordado do Flamengo." },
  { id: "p11", name: "Boné Corinthians Premium", categorySlug: "bones-premium", price: 59.90, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop", team: "Corinthians", sizes: ["Único"], description: "Boné premium bordado do Corinthians." },
  // Jogador
  { id: "p12", name: "Camisa PSG Jogador 2024", categorySlug: "modelo-jogador", price: 279.90, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop", team: "PSG", sizes: ["P","M","G","GG","XGG"], description: "Camisa modelo jogador do PSG.", badge: "Premium" },
  // Conjuntos Infantis
  { id: "p13", name: "Conjunto Infantil Flamengo", categorySlug: "conjuntos-infantis", price: 169.90, image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=500&fit=crop", team: "Flamengo", sizes: ["2","4","6","8","10","12","14"], description: "Conjunto infantil camisa + shorts do Flamengo." },
  // Agasalho
  { id: "p14", name: "Agasalho Manchester City", categorySlug: "conjuntos-agasalho", price: 349.90, image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=500&fit=crop", team: "Manchester City", sizes: ["P","M","G","GG","XGG"], description: "Conjunto de agasalho tailandês do Manchester City." },
  // Manga Longa
  { id: "p15", name: "Manga Longa Real Madrid", categorySlug: "mangas-longas", price: 259.90, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop", team: "Real Madrid", sizes: ["P","M","G","GG","XGG"], description: "Camisa manga longa tailandesa do Real Madrid." },
  // Corta-Vento
  { id: "p16", name: "Corta-Vento Liverpool", categorySlug: "corta-vento", price: 289.90, image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=500&fit=crop", team: "Liverpool", sizes: ["P","M","G","GG","XGG"], description: "Corta-vento tailandês do Liverpool FC." },
];
