document.addEventListener('DOMContentLoaded', function() {
  class NewsTicker {
    constructor() {
      this.marquee = document.getElementById('news-marquee');
      this.newsItems = [];
      this.adImages = [];
      this.usedAds = new Set();
      
      this.init();
    }
    
    async init() {
      await this.loadNews();
      await this.findAdImages();
      this.renderTicker();
    }
    
    async loadNews() {
      try {
        const response = await fetch('data/news.json');
        this.newsItems = await response.json();
      } catch (error) {
        console.error('Error loading news:', error);
        // Fallback через Jekyll variable
        if (window.newsData) {
          this.newsItems = window.newsData;
        }
      }
    }
    
    async findAdImages() {
      try {
        // Пробуем получить список файлов из папки ads
        // Это работает если у вас есть API или статический файл со списком
        const response = await fetch('assets/images/ads/');
        if (response.ok) {
          const text = await response.text();
          // Парсим HTML чтобы найти все изображения
          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(text, 'text/html');
          const images = htmlDoc.querySelectorAll('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"], a[href$=".webp"]');
          
          this.adImages = Array.from(images).map(img => 
            'assets/images/ads/' + img.getAttribute('href')
          );
        }
      } catch (error) {
        console.log('Cannot access ads directory, using fallback method');
        await this.scanAdImages();
      }
    }
    
    async scanAdImages() {
      // Альтернативный метод: пробуем загрузить изображения по шаблону
      const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
      const commonNames = ['ad', 'banner', 'promo', 'advert'];
      
      for (const name of commonNames) {
        for (let i = 1; i <= 10; i++) {
          for (const ext of extensions) {
            const path = `assets/images/ads/${name}${i}${ext}`;
            if (await this.imageExists(path)) {
              this.adImages.push(path);
            }
          }
        }
      }
      
      // Если ничего не найдено, используем fallback
      if (this.adImages.length === 0) {
        this.adImages = [
          'assets/images/ads/default-ad.jpg'
        ];
      }
    }
    
    async imageExists(url) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        return false;
      }
    }
    
    getRandomAd() {
      if (this.adImages.length === 0) return null;
      
      if (this.usedAds.size >= this.adImages.length) {
        this.usedAds.clear();
      }
      
      const availableAds = this.adImages.filter(ad => !this.usedAds.has(ad));
      const randomAd = availableAds.length > 0 
        ? availableAds[Math.floor(Math.random() * availableAds.length)]
        : this.adImages[0];
      
      this.usedAds.add(randomAd);
      return randomAd;
    }
    
    createNewsElement(news) {
      return `
        <div class="media">
          <div class="media-left">
            <div class="avatarholder">${news.source}</div>
          </div>
          <div class="media-body">
            <div class="media-heading">${news.title}</div>
            <div class="media-content">${news.content}</div>
          </div>
        </div>
      `;
    }
    
    createAdElement(adPath) {
      return `
        <div class="media">
          <img src="${adPath}" alt="Реклама" width="100%" loading="lazy">
        </div>
      `;
    }
    
    renderTicker() {
      if (this.newsItems.length === 0) {
        this.marquee.innerHTML = '<div class="media">Новости загружаются...</div>';
        return;
      }
      
      let tickerContent = '';
      
      this.newsItems.forEach(news => {
        tickerContent += this.createNewsElement(news);
        
        const ad = this.getRandomAd();
        tickerContent += this.createAdElement(ad);
      });
      
      this.marquee.innerHTML = tickerContent;
    }
  }
  
  new NewsTicker();
});