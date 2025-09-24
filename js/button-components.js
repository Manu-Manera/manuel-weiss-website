/**
 * Button Component System
 * Reusable, type-safe button components for the entire website
 */

// Button Base Class
class ButtonComponent {
    constructor(options = {}) {
        this.text = options.text || '';
        this.icon = options.icon || null;
        this.action = options.action || null;
        this.onClick = options.onClick || (() => {});
        this.className = options.className || '';
        this.disabled = options.disabled || false;
        this.loading = options.loading || false;
        this.variant = options.variant || 'primary'; // primary, secondary, outline, danger, success
        this.size = options.size || 'medium'; // small, medium, large
        this.fullWidth = options.fullWidth || false;
        this.id = options.id || null;
        this.ariaLabel = options.ariaLabel || this.text;
        this.testId = options.testId || null;
    }

    render() {
        const button = document.createElement('button');
        
        // Set attributes
        if (this.id) button.id = this.id;
        if (this.action) button.setAttribute('data-action', this.action);
        if (this.testId) button.setAttribute('data-testid', this.testId);
        
        button.setAttribute('aria-label', this.ariaLabel);
        button.disabled = this.disabled || this.loading;
        
        // Build class list
        const classes = [
            'btn',
            `btn-${this.variant}`,
            `btn-${this.size}`,
            this.fullWidth ? 'btn-full-width' : '',
            this.loading ? 'btn-loading' : '',
            this.className
        ].filter(Boolean).join(' ');
        
        button.className = classes;
        
        // Build content
        let content = '';
        
        if (this.loading) {
            content = '<span class="btn-spinner"></span>';
        } else {
            if (this.icon) {
                content += `<i class="${this.icon}"></i>`;
            }
            if (this.text) {
                content += `<span class="btn-text">${this.text}</span>`;
            }
        }
        
        button.innerHTML = content;
        
        // Register with EventRegistry if action is provided
        if (this.action && window.eventRegistry) {
            window.eventRegistry.register(this.action, this.onClick, `Button: ${this.text}`);
        } else {
            // Fallback to direct event listener
            button.addEventListener('click', this.onClick);
        }
        
        return button;
    }
}

// Specialized Button Components
class WorkflowButton extends ButtonComponent {
    constructor(options = {}) {
        super({
            text: 'Neue Bewerbung erstellen',
            icon: 'fas fa-plus',
            action: 'start-workflow',
            variant: 'primary',
            size: 'large',
            testId: 'workflow-button',
            ...options
        });
    }
}

class SaveButton extends ButtonComponent {
    constructor(options = {}) {
        super({
            text: 'Speichern',
            icon: 'fas fa-save',
            action: 'save',
            variant: 'success',
            testId: 'save-button',
            ...options
        });
    }
}

class CancelButton extends ButtonComponent {
    constructor(options = {}) {
        super({
            text: 'Abbrechen',
            icon: 'fas fa-times',
            action: 'cancel',
            variant: 'outline',
            testId: 'cancel-button',
            ...options
        });
    }
}

class DeleteButton extends ButtonComponent {
    constructor(options = {}) {
        super({
            text: 'Löschen',
            icon: 'fas fa-trash',
            action: 'delete',
            variant: 'danger',
            testId: 'delete-button',
            ...options
        });
    }
}

class UploadButton extends ButtonComponent {
    constructor(options = {}) {
        super({
            text: 'Dokument hochladen',
            icon: 'fas fa-upload',
            action: 'upload-document',
            variant: 'secondary',
            testId: 'upload-button',
            ...options
        });
    }
}

// Button Factory
class ButtonFactory {
    static create(type, options = {}) {
        switch (type) {
            case 'workflow':
                return new WorkflowButton(options);
            case 'save':
                return new SaveButton(options);
            case 'cancel':
                return new CancelButton(options);
            case 'delete':
                return new DeleteButton(options);
            case 'upload':
                return new UploadButton(options);
            default:
                return new ButtonComponent(options);
        }
    }

    static createFromElement(element) {
        // Extract properties from existing HTML element
        const options = {
            text: element.textContent.trim(),
            className: element.className,
            id: element.id,
            disabled: element.disabled
        };

        // Extract icon
        const icon = element.querySelector('i');
        if (icon) {
            options.icon = icon.className;
        }

        // Extract action from onclick or data-action
        if (element.hasAttribute('data-action')) {
            options.action = element.getAttribute('data-action');
        } else if (element.hasAttribute('onclick')) {
            const onclick = element.getAttribute('onclick');
            const match = onclick.match(/^(\w+)\(/);
            if (match) {
                options.action = match[1];
            }
        }

        // Determine variant from classes
        if (element.classList.contains('btn-primary')) options.variant = 'primary';
        else if (element.classList.contains('btn-secondary')) options.variant = 'secondary';
        else if (element.classList.contains('btn-danger')) options.variant = 'danger';
        else if (element.classList.contains('btn-success')) options.variant = 'success';
        else if (element.classList.contains('btn-outline')) options.variant = 'outline';

        return new ButtonComponent(options);
    }
}

// Button Group Component
class ButtonGroup {
    constructor(buttons = [], options = {}) {
        this.buttons = buttons;
        this.className = options.className || '';
        this.align = options.align || 'left'; // left, center, right, space-between
    }

    render() {
        const group = document.createElement('div');
        group.className = `btn-group btn-group-${this.align} ${this.className}`;

        this.buttons.forEach(button => {
            if (button instanceof ButtonComponent) {
                group.appendChild(button.render());
            } else {
                group.appendChild(button);
            }
        });

        return group;
    }
}

// Automatic Migration Helper
class ButtonMigrator {
    static migrateAll() {
        const buttons = document.querySelectorAll('button[onclick]');
        let migrated = 0;

        buttons.forEach(button => {
            try {
                const newButton = ButtonFactory.createFromElement(button);
                const rendered = newButton.render();
                
                // Copy any additional attributes
                Array.from(button.attributes).forEach(attr => {
                    if (!['onclick', 'class', 'id'].includes(attr.name)) {
                        rendered.setAttribute(attr.name, attr.value);
                    }
                });

                // Replace old button with new one
                button.parentNode.replaceChild(rendered, button);
                migrated++;
            } catch (error) {
                console.error('[ButtonMigrator] Failed to migrate button:', error, button);
            }
        });

        console.log(`[ButtonMigrator] Migrated ${migrated} buttons`);
        return migrated;
    }

    static migrateSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) {
            console.error(`[ButtonMigrator] Section not found: ${sectionId}`);
            return 0;
        }

        const buttons = section.querySelectorAll('button[onclick]');
        let migrated = 0;

        buttons.forEach(button => {
            try {
                const newButton = ButtonFactory.createFromElement(button);
                const rendered = newButton.render();
                button.parentNode.replaceChild(rendered, button);
                migrated++;
            } catch (error) {
                console.error('[ButtonMigrator] Failed to migrate button:', error, button);
            }
        });

        return migrated;
    }
}

// Export for global use
window.ButtonComponent = ButtonComponent;
window.ButtonFactory = ButtonFactory;
window.ButtonGroup = ButtonGroup;
window.ButtonMigrator = ButtonMigrator;

// Specialized buttons
window.WorkflowButton = WorkflowButton;
window.SaveButton = SaveButton;
window.CancelButton = CancelButton;
window.DeleteButton = DeleteButton;
window.UploadButton = UploadButton;
