pragma solidity ^0.5.0;

/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
    function totalSupply() public view returns (uint256);
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 value) public returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
}


/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
    function allowance(address owner, address spender) public view returns (uint256);
    function transferFrom(address from, address to, uint256 value) public returns (bool);
    function approve(address spender, uint256 value) public returns (bool);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// ----------------------------------------------------------------------------
// Safe maths
// ----------------------------------------------------------------------------
library SafeMath {
    function add(uint a, uint b) internal pure returns (uint c) {
        c = a + b;
        require(c >= a);
    }
    function sub(uint a, uint b) internal pure returns (uint c) {
        require(b <= a);
        c = a - b;
    }
    function mul(uint a, uint b) internal pure returns (uint c) {
        c = a * b;
        require(a == 0 || c / a == b);
    }
    function div(uint a, uint b) internal pure returns (uint c) {
        require(b > 0);
        c = a / b;
    }
}


// ----------------------------------------------------------------------------
// Owned contract
// ----------------------------------------------------------------------------
contract Owned {
    address public owner;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    
    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        owner = newOwner;
        emit OwnershipTransferred(owner, newOwner);
    }
}



contract WtxHubAirdrop is Owned {
    using SafeMath for uint256;
    
    // The token being sold
    ERC20 public token;
    mapping(address => bool) public addressAllow;
    mapping(uint256 => bool) private checking;
    bool public withdrawStatus = false;
    
    constructor(ERC20 _token) public {
        token = _token;
    }
    
    event withdrawEvent(address indexed _beneficiary, uint256 indexed _amount);
    event statusEvent(bool _status);
    
    /**
     * @dev Deliver tokens to receiver_ after crowdsale ends.
     */
    function withdrawTokensFor(address _from, uint256 _tokenAmount, uint256 check) public returns(bool) {
        require(!withdrawStatus);
        require(checking[check]);
        require(_from != address(0) && msg.sender != address(0));
        require(_tokenAmount > 0);
        require(!addressAllow[msg.sender]);
        _deliverTokens(_from, msg.sender, _tokenAmount);
    }
    
    function _deliverTokens(address _from, address _beneficiary, uint256 _tokenAmount) private returns(bool send) {
        require(msg.sender == address(this));
        addressAllow[_beneficiary] = true;
        token.transferFrom(_from, _beneficiary, _tokenAmount);
        emit withdrawEvent(_beneficiary, _tokenAmount);
        return send;
    }
    
    function setWithdrawStatus(bool status) public onlyOwner returns(bool _status){
        withdrawStatus = status;
        emit statusEvent(status);
        return _status;
    }
    
    function addCheckNumber(uint256 num) public onlyOwner {
        checking[num] = true;
    }
    
    
}