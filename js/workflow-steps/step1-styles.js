// =================== STEP 1 CSS STYLES ===================
// Spezialisierte Styles für Step 1 Optimierungen

function injectStep1Styles() {
    const styleId = 'step1-optimized-styles';
    if (document.getElementById(styleId)) return; // Already injected
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Step 1 Optimizations */
        .step1-optimized .progress-indicator {
            margin-bottom: 2rem;
            text-align: center;
        }
        
        .step1-optimized .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            margin-bottom: 1rem;
            overflow: hidden;
        }
        
        .step1-optimized .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            border-radius: 4px;
            transition: width 0.5s ease;
            animation: progressShine 2s infinite;
        }
        
        @keyframes progressShine {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
        
        .step1-optimized .step-circles {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
        }
        
        .step1-optimized .circle {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 1rem;
            background: #e5e7eb;
            color: #6b7280;
            transition: all 0.3s ease;
        }
        
        .step1-optimized .circle.active {
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            color: white;
            transform: scale(1.1);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }
        
        .step1-optimized .circle.completed {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }
        
        /* Enhanced Form Groups */
        .step1-optimized .form-group.enhanced {
            margin-bottom: 2rem;
            position: relative;
        }
        
        .step1-optimized .input-wrapper {
            position: relative;
        }
        
        .step1-optimized .enhanced-input {
            transition: all 0.3s ease;
            font-size: 1rem !important;
        }
        
        .step1-optimized .enhanced-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            transform: translateY(-1px);
        }
        
        .step1-optimized .input-actions {
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            gap: 0.5rem;
        }
        
        .step1-optimized .clear-btn,
        .step1-optimized .smart-btn,
        .step1-optimized .suggest-btn {
            width: 2rem;
            height: 2rem;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
            transition: all 0.3s ease;
        }
        
        .step1-optimized .clear-btn {
            background: #f3f4f6;
            color: #6b7280;
        }
        
        .step1-optimized .clear-btn:hover {
            background: #ef4444;
            color: white;
        }
        
        .step1-optimized .smart-btn {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
        }
        
        .step1-optimized .smart-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
        }
        
        .step1-optimized .suggest-btn {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
        }
        
        .step1-optimized .suggest-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
        
        /* Autocomplete Dropdown */
        .step1-optimized .autocomplete-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .step1-optimized .autocomplete-item {
            padding: 0.75rem;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        
        .step1-optimized .autocomplete-item:hover {
            background: #f3f4f6;
        }
        
        /* Enhanced Textarea */
        .step1-optimized .editor-container {
            position: relative;
        }
        
        .step1-optimized .job-description-toolbar {
            display: flex;
            gap: 0.5rem;
            padding: 1rem;
            background: #f8fafc;
            border: 2px solid #e5e7eb;
            border-radius: 12px 12px 0 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .step1-optimized .toolbar-action {
            padding: 0.5rem 1rem;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            transition: all 0.3s ease;
        }
        
        .step1-optimized .toolbar-action:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
            transform: translateY(-1px);
        }
        
        .step1-optimized .toolbar-action.ai-action {
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            border-color: #8b5cf6;
        }
        
        .step1-optimized .toolbar-action.ai-action:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
        
        .step1-optimized .enhanced-textarea {
            resize: vertical;
            transition: all 0.3s ease;
        }
        
        .step1-optimized .enhanced-textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .step1-optimized .char-counter {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 1rem;
            background: #f8fafc;
            border: 2px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 12px 12px;
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        /* Live Analysis Panel */
        .step1-optimized .live-analysis-panel {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            padding: 1.5rem;
            border-radius: 16px;
            border: 1px solid #0284c7;
            margin-bottom: 2rem;
            animation: slideInUp 0.5s ease-out;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .step1-optimized .analysis-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .step1-optimized .analysis-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid #e0f2fe;
            text-align: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .step1-optimized .analysis-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(2, 132, 199, 0.15);
        }
        
        .step1-optimized .analysis-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
            font-weight: 600;
            color: #0369a1;
            font-size: 0.875rem;
        }
        
        .step1-optimized .analysis-content {
            font-size: 1.5rem;
            font-weight: 800;
            color: #0c4a6e;
            margin-bottom: 0.5rem;
        }
        
        .step1-optimized .analysis-indicator {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            font-size: 0.625rem;
            color: #10b981;
        }
        
        /* Auto-Save Status */
        .step1-optimized .auto-save-status {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: white;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            transition: all 0.3s ease;
            opacity: 0.7;
            z-index: 1000;
        }
        
        .step1-optimized .save-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .step1-optimized .save-indicator i {
            color: #10b981;
        }
        
        /* Enhanced Action Bar */
        .step1-optimized .action-bar.enhanced {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border-radius: 16px;
            margin-top: 2rem;
            border: 1px solid #e2e8f0;
        }
        
        .step1-optimized .import-options {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        
        .step1-optimized .import-btn {
            padding: 0.75rem 1rem;
            border: 2px solid #e5e7eb;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #374151;
        }
        
        .step1-optimized .import-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .step1-optimized .linkedin-btn:hover {
            border-color: #0077b5;
            color: #0077b5;
        }
        
        .step1-optimized .xing-btn:hover {
            border-color: #026466;
            color: #026466;
        }
        
        .step1-optimized .previous-btn:hover {
            border-color: #6b7280;
            color: #6b7280;
        }
        
        .step1-optimized .primary-actions {
            display: flex;
            gap: 1rem;
        }
        
        .step1-optimized .btn-primary.enhanced,
        .step1-optimized .btn-secondary.enhanced {
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            border: none;
        }
        
        .step1-optimized .btn-primary.enhanced {
            background: linear-gradient(135deg, #3b82f6, #1e40af);
            color: white;
        }
        
        .step1-optimized .btn-primary.enhanced:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }
        
        .step1-optimized .btn-secondary.enhanced {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            color: white;
        }
        
        .step1-optimized .btn-secondary.enhanced:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(107, 114, 128, 0.4);
        }
        
        .step1-optimized .btn-ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        /* Keyboard Shortcuts Panel */
        .step1-optimized .keyboard-shortcuts-panel {
            position: fixed;
            bottom: 6rem;
            right: 2rem;
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            border: 1px solid #e5e7eb;
            max-width: 300px;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .step1-optimized .shortcuts-grid {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .step1-optimized .shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            background: #f8fafc;
            border-radius: 6px;
        }
        
        .step1-optimized .shortcut-key {
            font-family: monospace;
            background: #374151;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .step1-optimized .shortcut-desc {
            font-size: 0.875rem;
            color: #6b7280;
            flex: 1;
            margin-left: 1rem;
        }
        
        /* Help Button */
        .step1-optimized .help-button {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            border: none;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.125rem;
            transition: all 0.3s ease;
            margin-left: auto;
        }
        
        .step1-optimized .help-button:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
        
        /* Input Feedback */
        .step1-optimized .input-feedback {
            margin-top: 0.5rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .step1-optimized .step-circles {
                gap: 0.5rem;
            }
            
            .step1-optimized .circle {
                width: 2rem;
                height: 2rem;
                font-size: 0.875rem;
            }
            
            .step1-optimized .analysis-grid {
                grid-template-columns: 1fr;
            }
            
            .step1-optimized .action-bar.enhanced {
                flex-direction: column;
                gap: 1rem;
                align-items: stretch;
            }
            
            .step1-optimized .import-options {
                justify-content: center;
            }
            
            .step1-optimized .primary-actions {
                justify-content: center;
            }
            
            .step1-optimized .auto-save-status {
                bottom: 1rem;
                right: 1rem;
            }
            
            .step1-optimized .keyboard-shortcuts-panel {
                bottom: 5rem;
                right: 1rem;
                left: 1rem;
                max-width: none;
            }
        }
    `;
    
    document.head.appendChild(style);
}

console.log('✅ Step 1 Styles geladen');
