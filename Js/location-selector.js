// js/location-selector.js
class LocationSelector {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.onLocationChange = options.onLocationChange || null;
        this.showShippingCost = options.showShippingCost || false;
        this.initialCounty = options.initialCounty || '';
        this.initialTown = options.initialTown || '';
        this.initialAddress = options.initialAddress || '';
        
        this.init();
    }

    async init() {
        // Create the HTML structure
        this.render();
        
        // Load counties and setup events
        await this.loadCounties();
        this.setupEventListeners();
        
        // Set initial values if provided
        if (this.initialCounty && this.initialTown) {
            await this.setLocation(this.initialCounty, this.initialTown, this.initialAddress);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="location-selector">
                <!-- County Selection -->
                <div class="form-group">
                    <label class="form-label">County</label>
                    <select class="form-input" id="${this.container.id}-countySelect" required>
                        <option value="">Select County</option>
                    </select>
                </div>

                <!-- Town Selection -->
                <div class="form-group">
                    <label class="form-label">Town/Area</label>
                    <select class="form-input" id="${this.container.id}-townSelect" disabled required>
                        <option value="">Select Town</option>
                    </select>
                    <div class="shipping-cost" id="${this.container.id}-shippingCostDisplay" style="display: none;">
                        Shipping: <strong id="${this.container.id}-shippingAmount">KSh 0</strong>
                    </div>
                </div>

                <!-- Specific Address -->
                <div class="form-group">
                    <label class="form-label">Address Line</label>
                    <input type="text" class="form-input" id="${this.container.id}-addressLine" 
                           placeholder="House number, street, building" 
                           value="${this.initialAddress || ''}" required>
                </div>

                <!-- GPS Location Button -->
                <div class="form-group">
                    <button type="button" class="btn btn-secondary" id="${this.container.id}-gpsLocationBtn" style="width: 100%;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Use My Current Location
                    </button>
                    <div class="location-error" id="${this.container.id}-locationError" style="display: none;"></div>
                </div>
            </div>
        `;
    }

    async loadCounties() {
        try {
            console.log('📍 Loading counties...');
            const { data: counties, error } = await supabase
                .from('kenyan_locations')
                .select('DISTINCT county')
                .order('county');

            if (error) throw error;

            const countySelect = document.getElementById(`${this.container.id}-countySelect`);
            countySelect.innerHTML = '<option value="">Select County</option>';
            
            counties.forEach(county => {
                const option = document.createElement('option');
                option.value = county.county;
                option.textContent = county.county;
                countySelect.appendChild(option);
            });

            console.log('✅ Counties loaded:', counties.length);

        } catch (error) {
            console.error('❌ Error loading counties:', error);
            this.showError('Failed to load counties. Please refresh the page.');
        }
    }

    async loadTowns(county) {
        try {
            console.log(`📍 Loading towns for ${county}...`);
            const { data: towns, error } = await supabase
                .from('kenyan_locations')
                .select('town, shipping_cost')
                .eq('county', county)
                .order('town');

            if (error) throw error;

            const townSelect = document.getElementById(`${this.container.id}-townSelect`);
            const shippingDisplay = document.getElementById(`${this.container.id}-shippingCostDisplay`);
            
            townSelect.innerHTML = '<option value="">Select Town</option>';
            townSelect.disabled = false;

            towns.forEach(town => {
                const option = document.createElement('option');
                option.value = town.town;
                option.textContent = this.showShippingCost ? 
                    `${town.town} (KSh ${town.shipping_cost})` : town.town;
                option.dataset.shippingCost = town.shipping_cost;
                townSelect.appendChild(option);
            });

            if (this.showShippingCost) {
                shippingDisplay.style.display = 'block';
            }

            console.log(`✅ Towns loaded for ${county}:`, towns.length);

        } catch (error) {
            console.error('❌ Error loading towns:', error);
            this.showError('Failed to load towns. Please try again.');
        }
    }

    setupEventListeners() {
        const countySelect = document.getElementById(`${this.container.id}-countySelect`);
        const townSelect = document.getElementById(`${this.container.id}-townSelect`);
        const gpsBtn = document.getElementById(`${this.container.id}-gpsLocationBtn`);
        const addressLine = document.getElementById(`${this.container.id}-addressLine`);

        countySelect.addEventListener('change', (e) => {
            this.hideError();
            if (e.target.value) {
                this.loadTowns(e.target.value);
            } else {
                townSelect.innerHTML = '<option value="">Select Town</option>';
                townSelect.disabled = true;
                this.hideShippingCost();
            }
            this.triggerLocationChange();
        });

        townSelect.addEventListener('change', (e) => {
            this.hideError();
            if (e.target.value) {
                this.updateShippingCost(e.target.selectedOptions[0].dataset.shippingCost);
            } else {
                this.hideShippingCost();
            }
            this.triggerLocationChange();
        });

        addressLine.addEventListener('input', () => {
            this.triggerLocationChange();
        });

        gpsBtn.addEventListener('click', () => {
            this.getCurrentLocation();
        });
    }

    updateShippingCost(cost) {
        if (!this.showShippingCost) return;
        
        const shippingAmount = document.getElementById(`${this.container.id}-shippingAmount`);
        const shippingDisplay = document.getElementById(`${this.container.id}-shippingCostDisplay`);
        
        if (shippingAmount && shippingDisplay) {
            shippingAmount.textContent = `KSh ${cost}`;
            shippingDisplay.style.display = 'block';
        }
    }

    hideShippingCost() {
        if (!this.showShippingCost) return;
        
        const shippingDisplay = document.getElementById(`${this.container.id}-shippingCostDisplay`);
        if (shippingDisplay) {
            shippingDisplay.style.display = 'none';
        }
    }

    async getCurrentLocation() {
        const gpsBtn = document.getElementById(`${this.container.id}-gpsLocationBtn`);
        const originalText = gpsBtn.innerHTML;
        
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }

        gpsBtn.innerHTML = '📍 Detecting location...';
        gpsBtn.classList.add('gps-loading');
        this.hideError();

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                });
            });

            const { latitude, longitude } = position.coords;
            console.log('📍 GPS Coordinates:', latitude, longitude);
            
            // For now, we'll show coordinates and suggest manual selection
            // In production, integrate with a geocoding service
            this.showError(`Location detected! Coordinates: ${lat}, ${lng}. Please select your county and town from the dropdowns.`, 'info');
            
        } catch (error) {
            console.error('❌ GPS Error:', error);
            let errorMessage = 'Unable to get your location. ';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Please allow location access in your browser settings.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out.';
                    break;
                default:
                    errorMessage += 'Please select manually.';
            }
            
            this.showError(errorMessage);
        } finally {
            gpsBtn.innerHTML = originalText;
            gpsBtn.classList.remove('gps-loading');
        }
    }

    showError(message, type = 'error') {
        const errorElement = document.getElementById(`${this.container.id}-locationError`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.style.color = type === 'info' ? '#f97316' : '#dc2626';
        }
    }

    hideError() {
        const errorElement = document.getElementById(`${this.container.id}-locationError`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    triggerLocationChange() {
        if (this.onLocationChange) {
            this.onLocationChange(this.getSelectedLocation());
        }
    }

    getSelectedLocation() {
        const countySelect = document.getElementById(`${this.container.id}-countySelect`);
        const townSelect = document.getElementById(`${this.container.id}-townSelect`);
        const addressLine = document.getElementById(`${this.container.id}-addressLine`);

        return {
            county: countySelect.value,
            town: townSelect.value,
            address: addressLine.value,
            shippingCost: townSelect.selectedOptions[0]?.dataset.shippingCost || 0,
            isValid: countySelect.value && townSelect.value && addressLine.value
        };
    }

    async setLocation(county, town, address = '') {
        const countySelect = document.getElementById(`${this.container.id}-countySelect`);
        const addressLine = document.getElementById(`${this.container.id}-addressLine`);
        
        countySelect.value = county;
        addressLine.value = address;
        
        if (county) {
            await this.loadTowns(county);
            const townSelect = document.getElementById(`${this.container.id}-townSelect`);
            townSelect.value = town;
            
            if (town) {
                this.updateShippingCost(townSelect.selectedOptions[0]?.dataset.shippingCost || 0);
            }
        }
        
        this.triggerLocationChange();
    }

    // Method to clear the selection
    clear() {
        const countySelect = document.getElementById(`${this.container.id}-countySelect`);
        const townSelect = document.getElementById(`${this.container.id}-townSelect`);
        const addressLine = document.getElementById(`${this.container.id}-addressLine`);
        
        countySelect.value = '';
        townSelect.innerHTML = '<option value="">Select Town</option>';
        townSelect.disabled = true;
        addressLine.value = '';
        this.hideShippingCost();
        this.hideError();
        
        this.triggerLocationChange();
    }
}