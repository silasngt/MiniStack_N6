document.addEventListener('DOMContentLoaded', function () {
  console.log('🔍 ScriptK.js loaded');

  // ===== SEARCH AUTOCOMPLETE FUNCTIONALITY =====
  initializeSearchAutocomplete();

  // ===== SEARCH RESULT ENHANCEMENTS =====
  initializeSearchEnhancements();

  console.log('✅ Search JavaScript initialized');
});

// ===== SEARCH AUTOCOMPLETE =====
function initializeSearchAutocomplete() {
  const searchForm = document.querySelector('form[action="/search"]');
  const searchInput = searchForm?.querySelector('input[name="q"]');

  if (!searchInput) {
    console.log('ℹ️ Search input not found, skipping autocomplete');
    return;
  }

  let autocompleteContainer = null;
  let debounceTimer = null;
  let isAutocompleteVisible = false;

  console.log('🔍 Search autocomplete initialized');

  // Create autocomplete container
  function createAutocompleteContainer() {
    if (autocompleteContainer) return;

    const formContainer =
      searchInput.closest('.d-flex') || searchInput.parentElement;
    if (!formContainer) return;

    // Make form container relative
    formContainer.style.position = 'relative';

    autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'search-autocomplete';
    autocompleteContainer.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e0e0e0;
      border-top: none;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 1000;
      max-height: 300px;
      overflow-y: auto;
      display: none;
    `;
    formContainer.appendChild(autocompleteContainer);
  }

  // Show autocomplete suggestions
  function showAutocomplete(suggestions) {
    if (!autocompleteContainer || suggestions.length === 0) {
      hideAutocomplete();
      return;
    }

    autocompleteContainer.innerHTML = '';

    suggestions.forEach((suggestion, index) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.style.cssText = `
        padding: 12px 15px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        font-size: 0.9rem;
        transition: background-color 0.2s;
      `;
      item.textContent = suggestion.title;

      // Hover effect
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#f8f9fa';
      });
      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = 'white';
      });

      // Click to select
      item.addEventListener('click', () => {
        searchInput.value = suggestion.title;
        hideAutocomplete();
        searchForm.submit();
      });

      autocompleteContainer.appendChild(item);
    });

    autocompleteContainer.style.display = 'block';
    isAutocompleteVisible = true;
  }

  // Hide autocomplete
  function hideAutocomplete() {
    if (autocompleteContainer) {
      autocompleteContainer.style.display = 'none';
      isAutocompleteVisible = false;
    }
  }

  // Show loading state
  function showLoading() {
    if (!autocompleteContainer) return;

    autocompleteContainer.innerHTML = `
      <div style="padding: 12px 15px; text-align: center; color: #666; font-style: italic;">
        <i class="fas fa-spinner fa-spin"></i> Đang tìm kiếm...
      </div>
    `;
    autocompleteContainer.style.display = 'block';
  }

  // Fetch suggestions from API
  async function fetchSuggestions(query) {
    try {
      showLoading();

      const response = await fetch(
        `/search/suggestions?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.suggestions && data.suggestions.length > 0) {
        showAutocomplete(data.suggestions);
      } else {
        // Show "no suggestions" message
        if (autocompleteContainer) {
          autocompleteContainer.innerHTML = `
            <div style="padding: 12px 15px; text-align: center; color: #999; font-style: italic;">
              Không tìm thấy gợi ý nào
            </div>
          `;
          autocompleteContainer.style.display = 'block';
          setTimeout(hideAutocomplete, 2000);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching suggestions:', error);
      hideAutocomplete();
    }
  }

  // Input event handler with debouncing
  searchInput.addEventListener('input', function (e) {
    const query = e.target.value.trim();

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (query.length < 2) {
      hideAutocomplete();
      return;
    }

    // Create container if not exists
    createAutocompleteContainer();

    // Debounce search to avoid too many API calls
    debounceTimer = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  });

  // Hide autocomplete when clicking outside
  document.addEventListener('click', function (e) {
    if (isAutocompleteVisible && !searchForm.contains(e.target)) {
      hideAutocomplete();
    }
  });

  // Keyboard navigation
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      hideAutocomplete();
    } else if (e.key === 'Enter' && isAutocompleteVisible) {
      e.preventDefault();

      // Select first suggestion if available
      const firstItem =
        autocompleteContainer?.querySelector('.autocomplete-item');
      if (firstItem) {
        firstItem.click();
      }
    }
  });

  console.log('✅ Search autocomplete setup complete');
}

// ===== SEARCH RESULT ENHANCEMENTS =====
function initializeSearchEnhancements() {
  // Highlight search terms in results
  highlightSearchTerms();

  // Track search result clicks for analytics
  trackSearchResultClicks();

  // Enhance pagination UX
  enhancePagination();
}

// Highlight search terms in results
function highlightSearchTerms() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('q');

  if (!searchQuery) return;

  const terms = searchQuery.split(' ').filter((term) => term.length > 2);
  if (terms.length === 0) return;

  const resultElements = document.querySelectorAll(
    '.result-title a, .result-content p'
  );

  resultElements.forEach((element) => {
    let html = element.innerHTML;

    terms.forEach((term) => {
      const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
      html = html.replace(
        regex,
        '<mark style="background: #ffeb3b; padding: 1px 2px; border-radius: 2px;">$1</mark>'
      );
    });

    element.innerHTML = html;
  });

  console.log(`✅ Highlighted ${terms.length} search terms`);
}

// Escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Track search result clicks
function trackSearchResultClicks() {
  const searchResults = document.querySelectorAll(
    '.search-result-item .result-title a'
  );

  searchResults.forEach((link, index) => {
    link.addEventListener('click', function (e) {
      console.log(`📊 Search result clicked: ${index + 1}`, {
        title: this.textContent.trim(),
        url: this.href,
        position: index + 1,
      });

      // Optional: Send analytics data
      // trackAnalytics('search_result_click', { position: index + 1, url: this.href });
    });
  });

  if (searchResults.length > 0) {
    console.log(`✅ Tracking ${searchResults.length} search result clicks`);
  }
}

// Enhance pagination UX
function enhancePagination() {
  const paginationLinks = document.querySelectorAll('.pagination .page-link');

  paginationLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      // Don't prevent default, just add loading indication
      if (!this.parentElement.classList.contains('disabled')) {
        const originalText = this.textContent;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        // Restore text if navigation fails
        setTimeout(() => {
          if (this.innerHTML.includes('spinner')) {
            this.textContent = originalText;
          }
        }, 5000);
      }
    });
  });

  console.log('✅ Pagination UX enhanced');
}

// ===== UTILITY FUNCTIONS =====

// Show notification (reusable)
function showNotification(message, type = 'info') {
  const existing = document.querySelector('.search-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `search-notification alert alert-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    max-width: 300px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  `;
  notification.innerHTML = `
    ${message}
    <button type="button" class="close" style="background: none; border: none; font-size: 1.2rem; margin-left: 10px;">&times;</button>
  `;

  document.body.appendChild(notification);

  // Auto remove
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);

  // Manual close
  notification.querySelector('.close').addEventListener('click', () => {
    notification.remove();
  });
}

// Expose utility functions globally if needed
window.showSearchNotification = showNotification;

console.log('🔍 Search utilities loaded');
