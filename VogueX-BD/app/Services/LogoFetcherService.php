<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LogoFetcherService
{
    protected $client;
    
    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 10,
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ]
        ]);
    }
    
    public function getDesignerLogo($designerName)
    {
        // 1. Intentar con logos conocidos
        $knownLogo = $this->getKnownLogo($designerName);
        if ($knownLogo && $this->isImageAccessible($knownLogo)) {
            return $knownLogo;
        }
        
        // 2. Intentar con Clearbit Logo API
        $clearbitLogo = $this->getClearbitLogo($designerName);
        if ($clearbitLogo && $this->isImageAccessible($clearbitLogo)) {
            return $clearbitLogo;
        }
        
        // 3. Intentar con Logo.dev
        $logoDevLogo = $this->getLogoDevLogo($designerName);
        if ($logoDevLogo && $this->isImageAccessible($logoDevLogo)) {
            return $logoDevLogo;
        }
        
        // 4. Generar avatar con iniciales
        return $this->generateAvatarUrl($designerName);
    }
    
    protected function getKnownLogo($name)
    {
        $logos = [
            'Nike' => 'https://cdn.worldvectorlogo.com/logos/nike-4.svg',
            'Adidas' => 'https://cdn.worldvectorlogo.com/logos/adidas-9.svg',
            'Supreme' => 'https://cdn.worldvectorlogo.com/logos/supreme-2.svg',
            'Off-White' => 'https://seeklogo.com/images/O/off-white-logo-2E7E67F4C8-seeklogo.com.png',
            'Gucci' => 'https://cdn.worldvectorlogo.com/logos/gucci-logo-1.svg',
            'Louis Vuitton' => 'https://cdn.worldvectorlogo.com/logos/louis-vuitton-4.svg',
            'Balenciaga' => 'https://seeklogo.com/images/B/balenciaga-logo-9B41BF5C6F-seeklogo.com.png',
            'Dior' => 'https://cdn.worldvectorlogo.com/logos/dior-logo.svg',
            'Yeezy' => 'https://seeklogo.com/images/Y/yeezy-logo-1E8FB71518-seeklogo.com.png',
            'Jordan' => 'https://cdn.worldvectorlogo.com/logos/air-jordan-6.svg',
            'Prada' => 'https://cdn.worldvectorlogo.com/logos/prada-4.svg',
            'Versace' => 'https://cdn.worldvectorlogo.com/logos/versace-4.svg',
            'Fendi' => 'https://cdn.worldvectorlogo.com/logos/fendi-logo.svg',
            'Burberry' => 'https://cdn.worldvectorlogo.com/logos/burberry-1.svg',
            'Calvin Klein' => 'https://cdn.worldvectorlogo.com/logos/calvin-klein-logo.svg',
            'Tommy Hilfiger' => 'https://cdn.worldvectorlogo.com/logos/tommy-hilfiger-logo.svg',
            'Ralph Lauren' => 'https://cdn.worldvectorlogo.com/logos/polo-ralph-lauren-2.svg',
            'Hugo Boss' => 'https://cdn.worldvectorlogo.com/logos/hugo-boss-logo.svg',
            'Armani' => 'https://cdn.worldvectorlogo.com/logos/giorgio-armani-logo.svg',
            'Stone Island' => 'https://seeklogo.com/images/S/stone-island-logo-4E0A3F1CF3-seeklogo.com.png',
            'The North Face' => 'https://cdn.worldvectorlogo.com/logos/the-north-face-1.svg',
            'Patagonia' => 'https://cdn.worldvectorlogo.com/logos/patagonia-logo.svg',
            'Converse' => 'https://cdn.worldvectorlogo.com/logos/converse-logo.svg',
            'Vans' => 'https://cdn.worldvectorlogo.com/logos/vans-4.svg',
            'New Balance' => 'https://cdn.worldvectorlogo.com/logos/new-balance-2.svg',
            'ASICS' => 'https://cdn.worldvectorlogo.com/logos/asics-logo.svg',
            'Champion' => 'https://cdn.worldvectorlogo.com/logos/champion-logo.svg',
            'Kenzo' => 'https://seeklogo.com/images/K/kenzo-logo-1B84C5B7A4-seeklogo.com.png',
            'Valentino' => 'https://cdn.worldvectorlogo.com/logos/valentino-logo.svg',
            'Givenchy' => 'https://seeklogo.com/images/G/givenchy-logo-68D16E4C72-seeklogo.com.png',
            'Saint Laurent' => 'https://seeklogo.com/images/S/saint-laurent-logo-F4C69F9C48-seeklogo.com.png',
            'Alexander McQueen' => 'https://seeklogo.com/images/A/alexander-mcqueen-logo-0C44EECD38-seeklogo.com.png',
            'Bottega Veneta' => 'https://seeklogo.com/images/B/bottega-veneta-logo-2E45A2F89E-seeklogo.com.png',
            'Celine' => 'https://seeklogo.com/images/C/celine-logo-68D0A41F96-seeklogo.com.png',
            'Hermès' => 'https://cdn.worldvectorlogo.com/logos/hermes-logo.svg',
            'Chanel' => 'https://cdn.worldvectorlogo.com/logos/chanel-logo.svg'
        ];
        
        return $logos[$name] ?? null;
    }
    
    protected function getClearbitLogo($designerName)
    {
        // Clearbit Logo API - gratis para logos de empresa
        $domain = $this->guessDomain($designerName);
        if ($domain) {
            return "https://logo.clearbit.com/{$domain}";
        }
        return null;
    }
    
    protected function getLogoDevLogo($designerName)
    {
        // Logo.dev API
        $domain = $this->guessDomain($designerName);
        if ($domain) {
            return "https://img.logo.dev/{$domain}?token=pk_X0bDGtaJSs2xdu0p0WDUA";
        }
        return null;
    }
    
    protected function guessDomain($designerName)
    {
        $domains = [
            'Nike' => 'nike.com',
            'Adidas' => 'adidas.com',
            'Supreme' => 'supremenewyork.com',
            'Gucci' => 'gucci.com',
            'Louis Vuitton' => 'louisvuitton.com',
            'Balenciaga' => 'balenciaga.com',
            'Dior' => 'dior.com',
            'Prada' => 'prada.com',
            'Versace' => 'versace.com',
            'Fendi' => 'fendi.com',
            'Burberry' => 'burberry.com',
            'Calvin Klein' => 'calvinklein.com',
            'Tommy Hilfiger' => 'tommyhilfiger.com',
            'Ralph Lauren' => 'ralphlauren.com',
            'Hugo Boss' => 'hugoboss.com',
            'Armani' => 'armani.com',
            'Stone Island' => 'stoneisland.com',
            'The North Face' => 'thenorthface.com',
            'Patagonia' => 'patagonia.com',
            'Converse' => 'converse.com',
            'Vans' => 'vans.com'
        ];
        
        return $domains[$designerName] ?? strtolower(str_replace(' ', '', $designerName)) . '.com';
    }
    
    protected function generateAvatarUrl($designerName)
    {
        // Generar avatar con iniciales usando DiceBear API
        $initials = $this->getInitials($designerName);
        $backgroundColor = $this->getColorFromName($designerName);
        
        return "https://api.dicebear.com/7.x/initials/svg?seed={$initials}&backgroundColor={$backgroundColor}&radius=10&fontSize=40";
    }
    
    protected function getInitials($name)
    {
        $words = explode(' ', $name);
        $initials = '';
        
        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper($word[0]);
                if (strlen($initials) >= 2) break;
            }
        }
        
        return $initials ?: strtoupper(substr($name, 0, 2));
    }
    
    protected function getColorFromName($name)
    {
        $colors = ['c084fc', 'fb7185', '34d399', 'fbbf24', '60a5fa', 'a78bfa', 'f87171', '4ade80'];
        $hash = crc32($name);
        return $colors[abs($hash) % count($colors)];
    }
    
    protected function isImageAccessible($url)
    {
        try {
            $response = $this->client->head($url);
            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            return false;
        }
    }
}
