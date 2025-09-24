/**
 * Central Event Registry System
 * Manages all button events across the entire website
 * No more onclick attributes!
 */

class EventRegistry {
    constructor() {
        this.registry = new Map();
        this.debug = true;
        this.initialized = false;
    }

    /**
     * Register a button action
     * @param {string} action - The action identifier (data-action attribute value)
     * @param {Function} handler - The function to execute
     * @param {string} description - Human-readable description for debugging
     */
    register(action, handler, description = '') {
        if (this.registry.has(action)) {
            console.warn(`[EventRegistry] Action "${action}" is already registered. Overwriting.`);
        }

        this.registry.set(action, {
            handler,
            description,
            callCount: 0,
            lastCalled: null
        });

        if (this.debug) {
            console.log(`[EventRegistry] Registered: ${action} - ${description}`);
        }

        // If DOM is ready, bind immediately
        if (this.initialized) {
            this.bindAction(action);
        }
    }

    /**
     * Register multiple actions at once
     * @param {Object} actions - Object with action definitions
     */
    registerBulk(actions) {
        Object.entries(actions).forEach(([action, config]) => {
            if (typeof config === 'function') {
                this.register(action, config, action);
            } else {
                this.register(action, config.handler, config.description || action);
            }
        });
    }

    /**
     * Bind a specific action to DOM elements
     * @param {string} action - The action to bind
     */
    bindAction(action) {
        const elements = document.querySelectorAll(`[data-action="${action}"]`);
        const config = this.registry.get(action);

        if (!config) {
            console.error(`[EventRegistry] No handler registered for action: ${action}`);
            return;
        }

        elements.forEach(element => {
            // Remove any existing listeners
            element.removeEventListener('click', element._eventRegistryHandler);

            // Create new handler
            element._eventRegistryHandler = (event) => {
                event.preventDefault();
                
                if (this.debug) {
                    console.log(`[EventRegistry] Click: ${action}`, {
                        element: element,
                        event: event
                    });
                }

                config.callCount++;
                config.lastCalled = new Date();

                try {
                    config.handler(event, element);
                } catch (error) {
                    console.error(`[EventRegistry] Error in handler for "${action}":`, error);
                }
            };

            // Add new listener
            element.addEventListener('click', element._eventRegistryHandler);
        });

        if (this.debug && elements.length > 0) {
            console.log(`[EventRegistry] Bound ${elements.length} elements to action: ${action}`);
        }
    }

    /**
     * Initialize the registry and bind all registered actions
     */
    init() {
        if (this.initialized) {
            console.warn('[EventRegistry] Already initialized');
            return;
        }

        // Bind all registered actions
        this.registry.forEach((config, action) => {
            this.bindAction(action);
        });

        // Watch for dynamic content
        this.observeDOM();

        this.initialized = true;
        console.log('[EventRegistry] Initialized with', this.registry.size, 'actions');
    }

    /**
     * Watch for dynamically added elements
     */
    observeDOM() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // Check if the node itself has data-action
                        if (node.hasAttribute && node.hasAttribute('data-action')) {
                            const action = node.getAttribute('data-action');
                            if (this.registry.has(action)) {
                                this.bindAction(action);
                            }
                        }

                        // Check children
                        if (node.querySelectorAll) {
                            const elements = node.querySelectorAll('[data-action]');
                            const actions = new Set();
                            elements.forEach(el => actions.add(el.getAttribute('data-action')));
                            actions.forEach(action => {
                                if (this.registry.has(action)) {
                                    this.bindAction(action);
                                }
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Get statistics about button usage
     */
    getStats() {
        const stats = {};
        this.registry.forEach((config, action) => {
            stats[action] = {
                description: config.description,
                callCount: config.callCount,
                lastCalled: config.lastCalled
            };
        });
        return stats;
    }

    /**
     * Debug: List all buttons on the page
     */
    listAllButtons() {
        const buttons = document.querySelectorAll('button');
        const info = [];

        buttons.forEach((button, index) => {
            info.push({
                index,
                text: button.textContent.trim(),
                dataAction: button.getAttribute('data-action'),
                onclick: button.hasAttribute('onclick') ? button.getAttribute('onclick') : null,
                id: button.id,
                className: button.className
            });
        });

        console.table(info);
        return info;
    }

    /**
     * Debug: Test a specific action
     */
    testAction(action) {
        const config = this.registry.get(action);
        if (!config) {
            console.error(`[EventRegistry] Action "${action}" not found`);
            return;
        }

        console.log(`[EventRegistry] Testing action: ${action}`);
        config.handler({ preventDefault: () => {} }, null);
    }

    /**
     * Convert onclick to data-action automatically
     */
    migrateOnclickAttributes() {
        const elements = document.querySelectorAll('[onclick]');
        let migrated = 0;

        elements.forEach(element => {
            const onclick = element.getAttribute('onclick');
            
            // Extract function name from onclick
            const match = onclick.match(/^(\w+)\(/);
            if (match) {
                const functionName = match[1];
                element.setAttribute('data-action', functionName);
                element.removeAttribute('onclick');
                migrated++;
                
                console.log(`[EventRegistry] Migrated: ${functionName}`);
            }
        });

        console.log(`[EventRegistry] Migrated ${migrated} onclick attributes`);
    }
}

// Create global instance
window.eventRegistry = new EventRegistry();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.eventRegistry.init();
    });
} else {
    window.eventRegistry.init();
}

// Expose debug functions in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.__DEBUG__ = window.__DEBUG__ || {};
    window.__DEBUG__.eventRegistry = {
        registry: window.eventRegistry,
        stats: () => window.eventRegistry.getStats(),
        listButtons: () => window.eventRegistry.listAllButtons(),
        test: (action) => window.eventRegistry.testAction(action),
        migrate: () => window.eventRegistry.migrateOnclickAttributes()
    };
}
