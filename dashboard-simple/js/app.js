// Contract addresses
const REGISTRY_ADDRESS = '0xDBe8c11e3e72062f6A8b3c64EBF8ED262B5D3A1b';
const RPC_URL = 'https://rpc.testnet.arc.network';

// Simplified ABI
const REGISTRY_ABI = [
  "function getInvoicesByPayer(address) view returns (bytes32[])",
  "function getInvoicesByPayee(address) view returns (bytes32[])"
];

// Initialize
async function init() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
    
    // For demo, show 0 invoices
    document.getElementById('total-invoices').textContent = '0';
    document.getElementById('pending-invoices').textContent = '0';
    document.getElementById('paid-invoices').textContent = '0';
    document.getElementById('held-invoices').textContent = '0';
    
    document.getElementById('invoice-list').innerHTML = `
      <div class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating an invoice using the CLI or SDK.</p>
        <div class="mt-6">
          <a href="https://testnet.arcscan.app/address/${REGISTRY_ADDRESS}" target="_blank" 
             class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            View Contract on Explorer
          </a>
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('invoice-list').innerHTML = `
      <p class="text-red-600">Error loading invoices: ${error.message}</p>
    `;
  }
}

// Load on page load
window.addEventListener('load', init);
