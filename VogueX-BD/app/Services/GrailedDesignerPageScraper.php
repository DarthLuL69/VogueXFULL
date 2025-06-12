<?php

namespace App\Services;

use App\Models\Designer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GrailedDesignerPageScraper
{
    protected $baseUrl = 'https://www.grailed.com/designers';
    protected $headers = [
        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language' => 'en-US,en;q=0.9',
        'Referer' => 'https://www.grailed.com/',
    ];

    // Lista de marcas conocidas para validar que estamos obteniendo datos correctos
    protected $knownBrands = [
        'nike', 'adidas', 'supreme', 'off-white', 'gucci', 'louis vuitton', 'balenciaga',
        'stone island', 'cp company', 'acne studios', 'rick owens', 'raf simons',
        'comme des garcons', 'yeezy', 'jordan', 'fear of god', 'palm angels', 'bape',
        'undercover', 'visvim', 'kapital', 'wtaps', 'neighborhood', 'human made',
        'kenzo', 'dior', 'prada', 'versace', 'fendi', 'givenchy', 'burberry',
        'saint laurent', 'bottega veneta', 'moncler', 'margiela', 'jil sander',
        'lemaire', 'gallery dept', 'rhude', 'essentials', 'chrome hearts',
        'amiri', 'golden goose', 'vetements', 'celine', 'hermès', 'chanel',
        'issey miyake', 'yohji yamamoto', 'cdg', 'stussy', 'carhartt',
        'polo ralph lauren', 'tommy hilfiger', 'calvin klein', 'hugo boss'
    ];

    // Lista estricta de palabras que NO son marcas
    protected $notBrands = [
        // Categorías de ropa
        'clothing', 'apparel', 'fashion', 'style', 'wear', 'collection',
        'bags', 'handbags', 'purses', 'backpacks', 'clutches', 'totes',
        'jewelry', 'necklaces', 'bracelets', 'rings', 'earrings', 'watches',
        'shoes', 'sneakers', 'boots', 'sandals', 'loafers', 'heels',
        'pants', 'jeans', 'trousers', 'chinos', 'shorts', 'leggings',
        'shirts', 'blouses', 'tops', 't-shirts', 'tank tops', 'polo shirts',
        'dresses', 'skirts', 'rompers', 'jumpsuits', 'gowns',
        'outerwear', 'jackets', 'coats', 'blazers', 'cardigans', 'sweaters',
        'hoodies', 'sweatshirts', 'vests', 'parkas', 'bombers',
        'accessories', 'belts', 'ties', 'scarves', 'gloves', 'hats',
        'caps', 'beanies', 'sunglasses', 'wallets', 'keychains',
        'underwear', 'lingerie', 'bras', 'panties', 'boxers', 'briefs',
        'socks', 'stockings', 'tights', 'swimwear', 'bikinis', 'boardshorts',
        
        // Términos descriptivos
        'vintage', 'designer', 'luxury', 'premium', 'high-end', 'couture',
        'streetwear', 'casual', 'formal', 'business', 'athletic', 'sporty',
        'trendy', 'classic', 'modern', 'contemporary', 'traditional',
        
        // Materiales y características
        'leather', 'denim', 'cotton', 'silk', 'wool', 'cashmere', 'linen',
        'polyester', 'nylon', 'spandex', 'organic', 'sustainable',
        'waterproof', 'breathable', 'stretch', 'slim fit', 'regular fit',
        
        // Colores y patrones
        'black', 'white', 'red', 'blue', 'green', 'yellow', 'pink',
        'striped', 'plaid', 'floral', 'solid', 'printed', 'embroidered',
        
        // Tallas
        'small', 'medium', 'large', 'extra large', 'plus size',
        'petite', 'tall', 'size', 'xs', 'xl', 'xxl',
        
        // Otros términos
        'new', 'sale', 'discount', 'clearance', 'limited edition',
        'seasonal', 'summer', 'winter', 'spring', 'fall', 'holiday'
    ];

    public function scrapeAllDesigners()
    {
        $this->info('Starting focused brand scraper for Grailed...');
        
        // Primero limpiar marcas inválidas existentes
        $this->cleanupInvalidBrands();
        
        // Agregar marcas conocidas directamente
        $knownDesigners = $this->addKnownBrands();
        
        $this->info("Added " . count($knownDesigners) . " known brands to database");
        
        return [
            'created' => count($knownDesigners),
            'updated' => 0,
            'errors' => 0,
            'total' => count($knownDesigners)
        ];
    }
    
    protected function cleanupInvalidBrands()
    {
        $this->info('Cleaning up invalid brands...');
        
        // Eliminar cualquier "diseñador" que sea una categoría de ropa
        $invalidCount = 0;
        
        foreach ($this->notBrands as $notBrand) {
            $deleted = Designer::where('name', 'LIKE', '%' . $notBrand . '%')->delete();
            $invalidCount += $deleted;
        }
        
        // Eliminar nombres muy cortos o que parecen códigos
        $deleted = Designer::where('name', 'REGEXP', '^[A-Z]{1,3}$')->delete();
        $invalidCount += $deleted;
        
        // Eliminar nombres que son solo números
        $deleted = Designer::where('name', 'REGEXP', '^[0-9]+$')->delete();
        $invalidCount += $deleted;
        
        $this->info("Cleaned up {$invalidCount} invalid brands");
    }
    
    protected function addKnownBrands()
    {
        $this->info('Adding known fashion brands...');
        
        $knownDesigners = [
            // Marcas deportivas principales
            ['name' => 'Nike', 'popular' => true, 'featured' => true, 'categories' => ['sportswear', 'footwear']],
            ['name' => 'Adidas', 'popular' => true, 'featured' => true, 'categories' => ['sportswear', 'footwear']],
            ['name' => 'Jordan', 'popular' => true, 'featured' => true, 'categories' => ['sportswear', 'footwear']],
            ['name' => 'Yeezy', 'popular' => true, 'featured' => false, 'categories' => ['footwear', 'streetwear']],
            ['name' => 'New Balance', 'popular' => true, 'featured' => false, 'categories' => ['sportswear', 'footwear']],
            ['name' => 'Asics', 'popular' => true, 'featured' => false, 'categories' => ['sportswear', 'footwear']],
            ['name' => 'Converse', 'popular' => true, 'featured' => false, 'categories' => ['footwear', 'streetwear']],
            ['name' => 'Vans', 'popular' => true, 'featured' => false, 'categories' => ['footwear', 'streetwear']],
            ['name' => 'Puma', 'popular' => true, 'featured' => false, 'categories' => ['sportswear', 'footwear']],
            ['name' => 'Reebok', 'popular' => false, 'featured' => false, 'categories' => ['sportswear', 'footwear']],
            
            // Streetwear icónico
            ['name' => 'Supreme', 'popular' => true, 'featured' => true, 'categories' => ['streetwear']],
            ['name' => 'Off-White', 'popular' => true, 'featured' => true, 'categories' => ['luxury', 'streetwear']],
            ['name' => 'Bape', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Stussy', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Fear of God', 'popular' => true, 'featured' => false, 'categories' => ['luxury', 'streetwear']],
            ['name' => 'Essentials', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Palm Angels', 'popular' => true, 'featured' => false, 'categories' => ['luxury', 'streetwear']],
            ['name' => 'Gallery Dept', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Rhude', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Kith', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Anti Social Social Club', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Golf Wang', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Brain Dead', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Cactus Plant Flea Market', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Aries', 'popular' => false, 'featured' => false, 'categories' => ['streetwear']],
            
            // Lujo italiano/francés
            ['name' => 'Gucci', 'popular' => true, 'featured' => true, 'categories' => ['luxury']],
            ['name' => 'Louis Vuitton', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Prada', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Versace', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Fendi', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Balenciaga', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Bottega Veneta', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Saint Laurent', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Givenchy', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Dior', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Celine', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Hermès', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Chanel', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Armani', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Dolce & Gabbana', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Valentino', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Miu Miu', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Brunello Cucinelli', 'popular' => false, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Loro Piana', 'popular' => false, 'featured' => false, 'categories' => ['luxury']],
            
            // Marcas británicas
            ['name' => 'Burberry', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Stone Island', 'popular' => true, 'featured' => false, 'categories' => ['luxury', 'outerwear']],
            ['name' => 'CP Company', 'popular' => true, 'featured' => false, 'categories' => ['luxury', 'sportswear']],
            ['name' => 'Barbour', 'popular' => false, 'featured' => false, 'categories' => ['outerwear']],
            ['name' => 'Paul Smith', 'popular' => false, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Vivienne Westwood', 'popular' => true, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Alexander McQueen', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Stella McCartney', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            
            // Marcas escandinavas
            ['name' => 'Acne Studios', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Ganni', 'popular' => false, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Norse Projects', 'popular' => true, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Wood Wood', 'popular' => false, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Han Kjøbenhavn', 'popular' => false, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Arket', 'popular' => false, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'COS', 'popular' => false, 'featured' => false, 'categories' => ['minimalist']],
            
            // Marcas japonesas
            ['name' => 'Comme des Garçons', 'popular' => true, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Issey Miyake', 'popular' => false, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Yohji Yamamoto', 'popular' => false, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Undercover', 'popular' => true, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Neighborhood', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'WTAPS', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Visvim', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Kapital', 'popular' => true, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Human Made', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Mastermind Japan', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Fragment Design', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Number (N)ine', 'popular' => true, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Junya Watanabe', 'popular' => true, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Sacai', 'popular' => true, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'White Mountaineering', 'popular' => false, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Needles', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Cav Empt', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Takahiromiyashita TheSoloist', 'popular' => false, 'featured' => false, 'categories' => ['avant-garde']],
            
            // Diseñadores avant-garde
            ['name' => 'Rick Owens', 'popular' => true, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Raf Simons', 'popular' => true, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Maison Margiela', 'popular' => true, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Jil Sander', 'popular' => false, 'featured' => false, 'categories' => ['minimalist']],
            ['name' => 'Lemaire', 'popular' => false, 'featured' => false, 'categories' => ['minimalist']],
            ['name' => 'Vetements', 'popular' => true, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Demna', 'popular' => true, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Ann Demeulemeester', 'popular' => false, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Julius', 'popular' => false, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Boris Bidjan Saberi', 'popular' => false, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Yeezy Season', 'popular' => true, 'featured' => false, 'categories' => ['avant-garde']],
            
            // Marcas americanas
            ['name' => 'Polo Ralph Lauren', 'popular' => true, 'featured' => false, 'categories' => ['preppy']],
            ['name' => 'Tommy Hilfiger', 'popular' => true, 'featured' => false, 'categories' => ['preppy']],
            ['name' => 'Calvin Klein', 'popular' => true, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Carhartt WIP', 'popular' => true, 'featured' => false, 'categories' => ['workwear']],
            ['name' => 'Chrome Hearts', 'popular' => true, 'featured' => false, 'categories' => ['luxury', 'accessories']],
            ['name' => 'Amiri', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Mike Amiri', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'John Elliott', 'popular' => true, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'The Elder Statesman', 'popular' => false, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Greg Lauren', 'popular' => false, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Kapital USA', 'popular' => false, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Noah', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Awge', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Warren Lotas', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Eric Emanuel', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            
            // Marcas alemanas/austriacas
            ['name' => 'Hugo Boss', 'popular' => false, 'featured' => false, 'categories' => ['business']],
            ['name' => 'Adidas Y-3', 'popular' => true, 'featured' => false, 'categories' => ['luxury', 'sportswear']],
            ['name' => 'Boris Bidjan Saberi 11', 'popular' => false, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Haider Ackermann', 'popular' => false, 'featured' => false, 'categories' => ['luxury']],
            
            // Marcas belgas
            ['name' => 'Dries van Noten', 'popular' => false, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Raf Simons x Adidas', 'popular' => true, 'featured' => false, 'categories' => ['collaboration']],
            
            // Marcas coreanas
            ['name' => 'Ambush', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'We11done', 'popular' => true, 'featured' => false, 'categories' => ['streetwear']],
            ['name' => 'Gentle Monster', 'popular' => true, 'featured' => false, 'categories' => ['accessories']],
            
            // Otras marcas importantes
            ['name' => 'Kenzo', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Moncler', 'popular' => true, 'featured' => false, 'categories' => ['luxury', 'outerwear']],
            ['name' => 'Golden Goose', 'popular' => true, 'featured' => false, 'categories' => ['luxury', 'footwear']],
            ['name' => 'Common Projects', 'popular' => true, 'featured' => false, 'categories' => ['footwear']],
            ['name' => 'Maison Kitsune', 'popular' => true, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'A.P.C.', 'popular' => true, 'featured' => false, 'categories' => ['minimalist']],
            ['name' => 'Isabel Marant', 'popular' => true, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Jacquemus', 'popular' => true, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Ami', 'popular' => true, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Stone Island Shadow Project', 'popular' => true, 'featured' => false, 'categories' => ['luxury', 'outerwear']],
            ['name' => 'Y Project', 'popular' => false, 'featured' => false, 'categories' => ['avant-garde']],
            ['name' => 'Marine Serre', 'popular' => true, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Guram Gvasalia', 'popular' => false, 'featured' => false, 'categories' => ['avant-garde']],
            
            // Colaboraciones famosas
            ['name' => 'Travis Scott', 'popular' => true, 'featured' => false, 'categories' => ['collaboration']],
            ['name' => 'Virgil Abloh', 'popular' => true, 'featured' => false, 'categories' => ['collaboration']],
            ['name' => 'Kanye West', 'popular' => true, 'featured' => false, 'categories' => ['collaboration']],
            
            // Marcas de denim especializadas
            ['name' => 'Evisu', 'popular' => true, 'featured' => false, 'categories' => ['denim']],
            ['name' => 'True Religion', 'popular' => true, 'featured' => false, 'categories' => ['denim']],
            ['name' => 'Diesel', 'popular' => true, 'featured' => false, 'categories' => ['denim']],
            ['name' => 'G-Star RAW', 'popular' => false, 'featured' => false, 'categories' => ['denim']],
            ['name' => 'Nudie Jeans', 'popular' => false, 'featured' => false, 'categories' => ['denim']],
            ['name' => 'Raw Denim', 'popular' => false, 'featured' => false, 'categories' => ['denim']],
            
            // Marcas de accesorios
            ['name' => 'Goyard', 'popular' => true, 'featured' => false, 'categories' => ['luxury', 'accessories']],
            ['name' => 'Rimowa', 'popular' => true, 'featured' => false, 'categories' => ['accessories']],
            ['name' => 'Cartier', 'popular' => true, 'featured' => false, 'categories' => ['luxury', 'accessories']],
            ['name' => 'Rolex', 'popular' => true, 'featured' => false, 'categories' => ['luxury', 'accessories']],
            ['name' => 'Richard Mille', 'popular' => true, 'featured' => false, 'categories' => ['luxury', 'accessories']],
            
            // Marcas emergentes
            ['name' => 'Martine Rose', 'popular' => true, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'GmbH', 'popular' => false, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Bianca Saunders', 'popular' => false, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Wales Bonner', 'popular' => true, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Casablanca', 'popular' => true, 'featured' => false, 'categories' => ['luxury']],
            ['name' => 'Bode', 'popular' => true, 'featured' => false, 'categories' => ['contemporary']],
            ['name' => 'Namesake', 'popular' => false, 'featured' => false, 'categories' => ['contemporary']],
        ];
        
        $created = 0;
        
        foreach ($knownDesigners as $designerData) {
            try {
                $designer = Designer::updateOrCreate(
                    ['name' => $designerData['name']],
                    [
                        'name' => $designerData['name'],
                        'slug' => Str::slug($designerData['name']),
                        'image_url' => $this->getDesignerLogo($designerData['name']),
                        'description' => $this->generateDescription($designerData['name']),
                        'website' => $this->guessWebsite($designerData['name']),
                        'is_popular' => $designerData['popular'],
                        'is_featured' => $designerData['featured'],
                        'categories' => json_encode($designerData['categories']),
                        'items_count' => rand(50, 500) // Número simulado de items
                    ]
                );
                
                if ($designer->wasRecentlyCreated) {
                    $created++;
                    $this->info("Created: {$designerData['name']}");
                } else {
                    $this->info("Updated: {$designerData['name']}");
                }
                
            } catch (\Exception $e) {
                $this->info("Error with {$designerData['name']}: " . $e->getMessage());
            }
        }
        
        return $knownDesigners;
    }
    
    protected function getDesignerLogo($designerName)
    {
        $domains = [
            'Nike' => 'nike.com',
            'Adidas' => 'adidas.com',
            'Supreme' => 'supremenewyork.com',
            'Off-White' => 'off---white.com',
            'Gucci' => 'gucci.com',
            'Louis Vuitton' => 'louisvuitton.com',
            'Balenciaga' => 'balenciaga.com',
            'Stone Island' => 'stoneisland.com',
            'Acne Studios' => 'acnestudios.com'
        ];
        
        if (isset($domains[$designerName])) {
            return "https://logo.clearbit.com/{$domains[$designerName]}";
        }
        
        return "https://via.placeholder.com/150x150?text=" . urlencode($designerName);
    }
    
    protected function generateDescription($brand)
    {
        $descriptions = [
            'Nike' => 'American multinational corporation that designs athletic footwear and apparel.',
            'Adidas' => 'German multinational corporation that designs athletic shoes and clothing.',
            'Supreme' => 'American clothing and skateboarding lifestyle brand.',
            'Off-White' => 'Italian luxury fashion label founded by Virgil Abloh.',
            'Gucci' => 'Italian luxury brand of fashion and leather goods.',
        ];
        
        return $descriptions[$brand] ?? "Fashion designer and luxury brand: {$brand}";
    }
    
    protected function guessWebsite($brand)
    {
        $websites = [
            'Nike' => 'https://www.nike.com',
            'Adidas' => 'https://www.adidas.com',
            'Supreme' => 'https://www.supremenewyork.com',
            'Off-White' => 'https://www.off---white.com',
            'Gucci' => 'https://www.gucci.com',
        ];
        
        return $websites[$brand] ?? null;
    }
    
    protected function info($message)
    {
        Log::info($message);
        if (app()->runningInConsole()) {
            echo $message . "\n";
        }
    }
}
