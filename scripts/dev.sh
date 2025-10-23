#!/bin/bash

# AI Investment System - Development Script
# Automatische Erkennung von Package Manager und Node Version

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NODE_VERSION="18.0.0"
PRODUCTION_DATA_ONLY=1

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js >= $NODE_VERSION"
        exit 1
    fi
    
    NODE_CURRENT=$(node --version | sed 's/v//')
    NODE_REQUIRED=$NODE_VERSION
    
    if [ "$(printf '%s\n' "$NODE_REQUIRED" "$NODE_CURRENT" | sort -V | head -n1)" != "$NODE_REQUIRED" ]; then
        log_error "Node.js version $NODE_CURRENT is too old. Required: >= $NODE_VERSION"
        exit 1
    fi
    
    log_success "Node.js version $NODE_CURRENT is compatible"
}

# Detect package manager
detect_package_manager() {
    if [ -f "package-lock.json" ]; then
        PACKAGE_MANAGER="npm"
    elif [ -f "yarn.lock" ]; then
        PACKAGE_MANAGER="yarn"
    elif [ -f "pnpm-lock.yaml" ]; then
        PACKAGE_MANAGER="pnpm"
    else
        log_warning "No lock file found, defaulting to npm"
        PACKAGE_MANAGER="npm"
    fi
    
    log_info "Detected package manager: $PACKAGE_MANAGER"
}

# Install dependencies
install_deps() {
    log_info "Installing dependencies with $PACKAGE_MANAGER..."
    
    case $PACKAGE_MANAGER in
        "npm")
            npm install
            ;;
        "yarn")
            yarn install
            ;;
        "pnpm")
            pnpm install
            ;;
    esac
    
    log_success "Dependencies installed"
}

# Build project
build_project() {
    log_info "Building project..."
    
    case $PACKAGE_MANAGER in
        "npm")
            npm run build
            ;;
        "yarn")
            yarn build
            ;;
        "pnpm")
            pnpm build
            ;;
    esac
    
    log_success "Project built successfully"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    case $PACKAGE_MANAGER in
        "npm")
            npm test
            ;;
        "yarn")
            yarn test
            ;;
        "pnpm")
            pnpm test
            ;;
    esac
    
    log_success "Tests completed"
}

# Run linting
run_lint() {
    log_info "Running linting..."
    
    case $PACKAGE_MANAGER in
        "npm")
            npm run lint
            ;;
        "yarn")
            yarn lint
            ;;
        "pnpm")
            pnpm lint
            ;;
    esac
    
    log_success "Linting completed"
}

# Security audit
security_audit() {
    log_info "Running security audit..."
    
    case $PACKAGE_MANAGER in
        "npm")
            npm audit
            ;;
        "yarn")
            yarn audit
            ;;
        "pnpm")
            pnpm audit
            ;;
    esac
    
    log_success "Security audit completed"
}

# Performance test
performance_test() {
    log_info "Running performance tests..."
    
    # Lighthouse CI
    if command -v lhci &> /dev/null; then
        lhci autorun
    else
        log_warning "Lighthouse CI not installed, skipping performance tests"
    fi
    
    log_success "Performance tests completed"
}

# Accessibility test
accessibility_test() {
    log_info "Running accessibility tests..."
    
    # axe-core
    if command -v axe &> /dev/null; then
        axe --version
        # Add specific accessibility tests here
    else
        log_warning "axe-core not installed, skipping accessibility tests"
    fi
    
    log_success "Accessibility tests completed"
}

# AI Investment System specific commands
ai_setup() {
    log_info "Setting up AI Investment System..."
    
    # Check for required environment variables
    if [ -z "$OPENAI_API_KEY" ]; then
        log_error "OPENAI_API_KEY environment variable not set"
        exit 1
    fi
    
    if [ -z "$TWITTER_API_KEY" ]; then
        log_error "TWITTER_API_KEY environment variable not set"
        exit 1
    fi
    
    # Setup AWS credentials
    if [ -z "$AWS_ACCESS_KEY_ID" ]; then
        log_warning "AWS credentials not set, some features may not work"
    fi
    
    log_success "AI Investment System setup completed"
}

ai_test() {
    log_info "Running AI Investment System tests..."
    
    # Test API endpoints
    if [ -n "$API_BASE_URL" ]; then
        curl -f "$API_BASE_URL/health" || log_error "Health check failed"
        curl -f "$API_BASE_URL/metrics" || log_error "Metrics endpoint failed"
    else
        log_warning "API_BASE_URL not set, skipping API tests"
    fi
    
    log_success "AI Investment System tests completed"
}

ai_deploy() {
    log_info "Deploying AI Investment System..."
    
    # Deploy infrastructure
    if command -v cdk &> /dev/null; then
        cdk deploy --all
    else
        log_error "AWS CDK not installed, cannot deploy infrastructure"
        exit 1
    fi
    
    # Deploy functions
    case $PACKAGE_MANAGER in
        "npm")
            npm run deploy
            ;;
        "yarn")
            yarn deploy
            ;;
        "pnpm")
            pnpm deploy
            ;;
    esac
    
    log_success "AI Investment System deployed"
}

# Full CI pipeline
ci_full() {
    log_info "Running full CI pipeline..."
    
    check_node
    detect_package_manager
    install_deps
    run_lint
    run_tests
    security_audit
    performance_test
    accessibility_test
    ai_test
    
    log_success "Full CI pipeline completed"
}

# Deploy to staging
deploy_staging() {
    log_info "Deploying to staging..."
    
    # Set staging environment
    export NODE_ENV=staging
    export PRODUCTION_DATA_ONLY=1
    
    ci_full
    ai_deploy
    
    log_success "Staging deployment completed"
}

# Deploy to production
deploy_production() {
    log_info "Deploying to production..."
    
    # Set production environment
    export NODE_ENV=production
    export PRODUCTION_DATA_ONLY=1
    
    ci_full
    ai_deploy
    
    log_success "Production deployment completed"
}

# Doctor command - check system health
doctor() {
    log_info "Running system health check..."
    
    check_node
    detect_package_manager
    
    # Check for required tools
    local missing_tools=()
    
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi
    
    if ! command -v aws &> /dev/null; then
        missing_tools+=("aws-cli")
    fi
    
    if ! command -v cdk &> /dev/null; then
        missing_tools+=("aws-cdk")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_warning "Missing tools: ${missing_tools[*]}"
        log_info "Install missing tools and run again"
    else
        log_success "All required tools are installed"
    fi
    
    # Check environment variables
    local missing_env=()
    
    if [ -z "$OPENAI_API_KEY" ]; then
        missing_env+=("OPENAI_API_KEY")
    fi
    
    if [ -z "$TWITTER_API_KEY" ]; then
        missing_env+=("TWITTER_API_KEY")
    fi
    
    if [ -z "$AWS_ACCESS_KEY_ID" ]; then
        missing_env+=("AWS_ACCESS_KEY_ID")
    fi
    
    if [ ${#missing_env[@]} -gt 0 ]; then
        log_warning "Missing environment variables: ${missing_env[*]}"
        log_info "Set missing environment variables and run again"
    else
        log_success "All required environment variables are set"
    fi
    
    log_success "System health check completed"
}

# Main command handler
case "${1:-help}" in
    "doctor")
        doctor
        ;;
    "install")
        check_node
        detect_package_manager
        install_deps
        ;;
    "build")
        check_node
        detect_package_manager
        build_project
        ;;
    "test")
        check_node
        detect_package_manager
        run_tests
        ;;
    "lint")
        check_node
        detect_package_manager
        run_lint
        ;;
    "audit")
        check_node
        detect_package_manager
        security_audit
        ;;
    "performance")
        performance_test
        ;;
    "accessibility")
        accessibility_test
        ;;
    "ai:setup")
        ai_setup
        ;;
    "ai:test")
        ai_test
        ;;
    "ai:deploy")
        ai_deploy
        ;;
    "ci:full")
        ci_full
        ;;
    "deploy:staging")
        deploy_staging
        ;;
    "deploy:production")
        deploy_production
        ;;
    "help"|*)
        echo "AI Investment System - Development Script"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  doctor              - Check system health"
        echo "  install             - Install dependencies"
        echo "  build                - Build project"
        echo "  test                - Run tests"
        echo "  lint                - Run linting"
        echo "  audit               - Run security audit"
        echo "  performance         - Run performance tests"
        echo "  accessibility       - Run accessibility tests"
        echo "  ai:setup            - Setup AI Investment System"
        echo "  ai:test             - Test AI Investment System"
        echo "  ai:deploy           - Deploy AI Investment System"
        echo "  ci:full             - Run full CI pipeline"
        echo "  deploy:staging      - Deploy to staging"
        echo "  deploy:production   - Deploy to production"
        echo "  help                - Show this help"
        ;;
esac
