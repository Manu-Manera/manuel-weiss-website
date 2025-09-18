// Persönlichkeitsentwicklung Search & Filter - JavaScript Module

// Search and Filter State
let currentSearch = '';
let currentFilter = 'all';

// Initialize Search and Filter
function initializeSearchAndFilter() {
    const searchInput = document.getElementById('methodSearch');
    const searchClear = document.getElementById('searchClear');
    const filterTags = document.querySelectorAll('.filter-tag');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearch = this.value.toLowerCase();
            filterMethods();
            updateSearchClear();
        });
    }
    
    if (searchClear) {
        searchClear.addEventListener('click', function() {
            searchInput.value = '';
            currentSearch = '';
            filterMethods();
            this.style.display = 'none';
        });
    }
    
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Remove active class from all tags
            filterTags.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tag
            this.classList.add('active');
            
            // Update current filter
            currentFilter = this.getAttribute('data-category');
            
            // Filter methods
            filterMethods();
        });
    });
}

// Filter Methods Function
function filterMethods() {
    const methodCards = document.querySelectorAll('.method-card');
    let visibleCount = 0;
    
    methodCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll('.method-tag')).map(tag => tag.textContent.toLowerCase());
        const category = card.getAttribute('data-category') || 'all';
        
        const matchesSearch = currentSearch === '' || 
            title.includes(currentSearch) || 
            description.includes(currentSearch) || 
            tags.some(tag => tag.includes(currentSearch));
        
        const matchesFilter = currentFilter === 'all' || category === currentFilter;
        
        if (matchesSearch && matchesFilter) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });
    
    // Show/hide no results message
    showNoResults(visibleCount === 0);
    
    // Update method count
    updateMethodCount(visibleCount);
}

// Show No Results Message
function showNoResults(show) {
    let noResultsDiv = document.querySelector('.no-results');
    
    if (show && !noResultsDiv) {
        noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results';
        noResultsDiv.innerHTML = `
            <i class="fas fa-search"></i>
            <h3>Keine Methoden gefunden</h3>
            <p>Versuche es mit anderen Suchbegriffen oder wähle eine andere Kategorie.</p>
            <button class="btn btn-primary" onclick="resetFilters()">Filter zurücksetzen</button>
        `;
        
        const methodsGrid = document.querySelector('.methods-grid');
        if (methodsGrid) {
            methodsGrid.appendChild(noResultsDiv);
        }
    } else if (!show && noResultsDiv) {
        noResultsDiv.remove();
    }
}

// Update Search Clear Button
function updateSearchClear() {
    const searchClear = document.getElementById('searchClear');
    if (searchClear) {
        searchClear.style.display = currentSearch ? 'block' : 'none';
    }
}

// Reset Filters
function resetFilters() {
    const searchInput = document.getElementById('methodSearch');
    const allFilterTag = document.querySelector('[data-category="all"]');
    
    if (searchInput) {
        searchInput.value = '';
    }
    currentSearch = '';
    currentFilter = 'all';
    
    if (allFilterTag) {
        document.querySelectorAll('.filter-tag').forEach(tag => tag.classList.remove('active'));
        allFilterTag.classList.add('active');
    }
    
    document.querySelectorAll('.method-card').forEach(card => {
        card.classList.remove('hidden');
    });
    
    const noResultsDiv = document.querySelector('.no-results');
    if (noResultsDiv) {
        noResultsDiv.remove();
    }
    
    const searchClear = document.getElementById('searchClear');
    if (searchClear) {
        searchClear.style.display = 'none';
    }
    
    updateMethodCount();
}

// Update Method Count
function updateMethodCount(visibleCount = null) {
    const countElement = document.querySelector('.method-count');
    if (!countElement) return;
    
    if (visibleCount !== null) {
        const totalCount = document.querySelectorAll('.method-card').length;
        countElement.innerHTML = `Zeige <strong>${visibleCount}</strong> von <strong>${totalCount}</strong> Methoden`;
    } else {
        const totalCount = document.querySelectorAll('.method-card').length;
        countElement.innerHTML = `<strong>${totalCount}</strong> Methoden verfügbar`;
    }
}

// Export functions for global use
window.initializeSearchAndFilter = initializeSearchAndFilter;
window.filterMethods = filterMethods;
window.resetFilters = resetFilters;
window.updateMethodCount = updateMethodCount;
