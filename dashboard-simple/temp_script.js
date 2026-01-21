function formatAmount(amount) {
  try {
    // Simple check: if amount string is too long, it's corrupted
    const amountStr = amount.toString();
    if (amountStr.length > 15) {
      return '<span class="text-red-500 text-xs">Invalid (test data)</span>';
    }
    return ethers.utils.formatUnits(amount, 6) + ' USDC';
  } catch (e) {
    return '<span class="text-red-500 text-xs">Error</span>';
  }
}
