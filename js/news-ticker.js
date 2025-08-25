document.addEventListener('DOMContentLoaded', function () {
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
                if (window.newsData) {
                    this.newsItems = window.newsData;
                }
            }
        }


        async findAdImages() {
            try {
                const response = await fetch('assets/images/ads/ads-list.json');
                if (response.ok) {
                    const data = await response.json();
                    this.adImages = data.images.map(img =>
                        'assets/images/ads/' + img
                    );
                }
            } catch (error) {
                console.log('Cannot load ads list, using fallback');
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
          <img src="${adPath}" alt="Реклама" width="100%">
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

            this.marquee.innerHTML = `<marquee direction="up" scrollamount="4" id="news-marquee" height="100%">${tickerContent}</marquee>`;
        }
    }

    new NewsTicker();
});