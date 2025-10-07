// =================== STEP 2 CSS STYLES ===================
// Spezialisierte Styles für Step 2 Optimierungen

function injectStep2Styles() {
    const styleId = 'step2-optimized-styles';
    if (document.getElementById(styleId)) return; // Already injected
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Step 2 Specific Enhancements */
        .circle.completed { 
            background: linear-gradient(135deg, #10b981, #059669); 
            color: white; 
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .circle.active { 
            background: linear-gradient(135deg, #10b981, #059669); 
            color: white; 
            transform: scale(1.1);
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }
        
        /* Analysis Mode Cards */
        .step2-optimized .analysis-mode-card {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .step2-optimized .analysis-mode-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .step2-optimized .analysis-mode-card.active {
            background: linear-gradient(135deg, #f0fdf4, #dcfce7) !important;
            border-color: #10b981 !important;
            box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }
        
        .step2-optimized .analysis-mode-card::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: rotate(45deg);
            transition: all 0.3s ease;
            opacity: 0;
        }
        
        .step2-optimized .analysis-mode-card:hover::before {
            animation: shimmer 1.5s ease-in-out;
            opacity: 1;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        /* Dashboard Metrics */
        .step2-optimized .metrics-grid .metric-card {
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .step2-optimized .metrics-grid .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border-color: #10b981;
        }
        
        .step2-optimized .metric-value {
            background: linear-gradient(135deg, #10b981, #059669);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: valueUpdate 0.5s ease-in-out;
        }
        
        @keyframes valueUpdate {
            0% { transform: scale(1.2); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        /* Analysis Button Enhancement */
        .step2-optimized .analysis-btn.enhanced {
            position: relative;
            overflow: hidden;
        }
        
        .step2-optimized .analysis-btn.enhanced:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }
        
        .step2-optimized .analysis-btn.enhanced:active {
            transform: translateY(0);
        }
        
        /* Requirements Display */
        .step2-optimized .requirements-display {
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
        
        .step2-optimized .requirement-item {
            transition: all 0.3s ease;
        }
        
        .step2-optimized .requirement-item:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            border-color: #10b981;
        }
        
        /* Skill Gap Section */
        .step2-optimized .skill-gap-section {
            animation: fadeInUp 0.5s ease-out;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .step2-optimized .skill-item {
            transition: all 0.3s ease;
        }
        
        .step2-optimized .skill-item:hover {
            transform: translateX(2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .step2-optimized .skill-item.matching:hover {
            background: #ecfdf5 !important;
            border-color: #059669 !important;
        }
        
        .step2-optimized .skill-item.missing:hover {
            background: #fef2f2 !important;
            border-color: #dc2626 !important;
        }
        
        /* Dashboard Controls */
        .step2-optimized .dashboard-btn {
            transition: all 0.3s ease;
        }
        
        .step2-optimized .dashboard-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        /* Performance Monitor */
        .step2-optimized .performance-monitor {
            animation: slideInFromRight 0.3s ease-out;
            backdrop-filter: blur(8px);
        }
        
        @keyframes slideInFromRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        /* Enhanced Action Bar for Step 2 */
        .step2-optimized .action-bar.step2 {
            padding: 1.5rem;
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border-radius: 16px;
            margin-top: 2rem;
            border: 1px solid #10b981;
        }
        
        .step2-optimized .skip-options {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        
        .step2-optimized .skip-btn {
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
        
        .step2-optimized .skip-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .step2-optimized .template-btn:hover {
            border-color: #3b82f6;
            color: #3b82f6;
        }
        
        .step2-optimized .manual-btn:hover {
            border-color: #f59e0b;
            color: #f59e0b;
        }
        
        .step2-optimized .later-btn:hover {
            border-color: #6b7280;
            color: #6b7280;
        }
        
        /* Priority and Category Badges */
        .step2-optimized .priority-badge {
            animation: pulseGlow 2s infinite;
        }
        
        @keyframes pulseGlow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
        
        /* Option Checkboxes */
        .step2-optimized .option-checkbox {
            transition: all 0.3s ease;
        }
        
        .step2-optimized .option-checkbox:hover {
            background: #f0fdf4;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
        }
        
        /* Application Summary Enhancement */
        .step2-optimized .application-summary {
            position: relative;
            overflow: hidden;
        }
        
        .step2-optimized .application-summary::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.05), transparent);
            transform: rotate(45deg);
            animation: summaryShimmer 3s infinite;
        }
        
        @keyframes summaryShimmer {
            0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        .step2-optimized .analysis-mode-badge {
            animation: badgePulse 2s infinite;
        }
        
        @keyframes badgePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        /* Button Effects for Step 2 */
        .step2-optimized .btn-primary.enhanced,
        .step2-optimized .btn-secondary.enhanced {
            position: relative;
            overflow: hidden;
        }
        
        .step2-optimized .btn-primary.enhanced:hover {
            background: linear-gradient(135deg, #059669, #047857);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }
        
        .step2-optimized .btn-secondary.enhanced:hover {
            background: linear-gradient(135deg, #4b5563, #374151);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(107, 114, 128, 0.4);
        }
        
        /* Requirement Actions */
        .step2-optimized .requirement-actions button {
            transition: all 0.3s ease;
        }
        
        .step2-optimized .requirement-actions button:hover {
            transform: scale(1.05);
        }
        
        /* Help Button for Step 2 */
        .step2-optimized .help-button {
            background: linear-gradient(135deg, #10b981, #059669);
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
        
        .step2-optimized .help-button:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }
        
        /* Analysis Options */
        .step2-optimized .analysis-options {
            margin-top: 1rem;
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .step2-optimized .analysis-options label {
            transition: all 0.3s ease;
        }
        
        .step2-optimized .analysis-options label:hover {
            background: #f0fdf4;
            padding: 0.5rem;
            border-radius: 8px;
            transform: translateY(-1px);
        }
        
        /* Progress Indicator for Step 2 */
        .step2-optimized .progress-fill {
            background: linear-gradient(135deg, #10b981, #059669);
            animation: progressPulse 2s infinite;
        }
        
        @keyframes progressPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
        
        /* Responsive Design for Step 2 */
        @media (max-width: 768px) {
            .step2-optimized .mode-grid {
                grid-template-columns: 1fr;
            }
            
            .step2-optimized .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .step2-optimized .skill-categories {
                grid-template-columns: 1fr;
            }
            
            .step2-optimized .action-bar.step2 {
                flex-direction: column;
                gap: 1rem;
                align-items: stretch;
            }
            
            .step2-optimized .skip-options {
                justify-content: center;
            }
            
            .step2-optimized .primary-actions {
                justify-content: center;
            }
            
            .step2-optimized .performance-monitor {
                top: 1rem;
                right: 1rem;
                left: 1rem;
                width: auto;
                font-size: 0.6rem;
            }
        }
        
        /* Loading States */
        .step2-optimized .loading-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }
        
        .step2-optimized .loading-spinner {
            width: 3rem;
            height: 3rem;
            border: 3px solid #e5e7eb;
            border-top-color: #10b981;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* Tooltip Enhancements */
        .step2-optimized [title]:hover {
            position: relative;
        }
        
        .step2-optimized [title]:hover::after {
            content: attr(title);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #374151;
            color: white;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.75rem;
            white-space: nowrap;
            z-index: 1000;
        }
        
        /* Smooth Transitions */
        .step2-optimized * {
            transition: all 0.3s ease;
        }
        
        /* Focus States */
        .step2-optimized button:focus,
        .step2-optimized input:focus {
            outline: 2px solid #10b981;
            outline-offset: 2px;
        }
    `;
    
    document.head.appendChild(style);
}

console.log('✅ Step 2 Styles geladen');
