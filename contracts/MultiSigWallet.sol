pragma solidity ^0.5.12;


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
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

// ----------------------------------------------------------------------------
// ERC Token Standard #20 Interface
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
// ----------------------------------------------------------------------------
contract ERC20Interface {
    function balanceOf(address tokenOwner) public view returns (uint balance);
    function transfer(address to, uint tokens) public returns (bool success);

    event Transfer(address indexed from, address indexed to, uint tokens);
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

contract MultiSigWallet is Owned {

    using SafeMath for uint;

    /*
     *  Events
     */
    event EventDeposit(address indexed sender, uint value);
    event EventOwnerAddition(address indexed owner);
    event EventDesactiveUnbankOwner(address indexed owner);
    event EventReactiveUnbankOwner(address indexed owner);
    event EventSetDestination(address indexed destination);
    event EventUpdateRequirement(bool);
    event EventConfirmTransaction(address indexed destination, uint indexed transactionId);

    /*
     *  Parameters
     */
    uint countSignAddOwner = 2;
    uint countSetDestination = 2;
    uint public ownerDesactive = 0;
    uint min = 2;
    uint max = 3;
    address private destination = 0x6231B14506B07dd238ae321b2e5e8356c5F516BE;
    ERC20Interface public token = ERC20Interface(0x5f8b14eea9bba2c316f3ec01520Af02697873F47);

    /*
     *  Storage
     */
    /// @param destination is the UHW address
    /// @param amount is the amount to send from UCW to UHW
    /// @param maxSignature is the number max of signatures required
    /// @param minSignatures the number minimum of signatures for a transaction to be valid.
    /// @param countSignature increments everytime someone signs a transaction
    /// @param executed boolean variable will be set to true once the minimum number of signatures is met.
    //  @param identifiant the ID of the signature.
    struct Transaction {
        address destination;
        uint amount;
        uint maxSignature;
        uint minSignatures;
        uint countSignature;
        bool executed;
        bool created;
        mapping (address => bool) confirm;
    }


    //  @param destination Hot Wallet
    mapping (address => bool) private unbankOwners;
    address[] private owners;
    address[] private notValidedOwners;
    mapping (address => uint) private notValidedOwnersIndex;
    mapping (uint => Transaction) private transactions;
    mapping (address => uint) private newUnbankOwners;
    mapping (address => mapping (address => bool)) private addUnbankOwnerHistory;
    // Destination
    mapping (address => mapping (address => bool)) private checkSetDestinationAddress;
    mapping (address => uint) private countSetDestinationAddress;

    /*
     *  Modifiers
     */
    modifier onlyWallet() {
        require(msg.sender == address(this));
        _;
    }

    modifier requireDesactiveOwner() {
        require(owners.length >= 3);
        _;
    }

    modifier checkTransaction(uint transactionId) {
        require(transactions[transactionId].created);
        _;
    }

    modifier validTransaction(uint transactionId) {
        require(!transactions[transactionId].executed);
        _;
    }

    modifier requireSetParams(uint _count) {
        require(_count > 2 && owners.length > _count);
        _;
    }

    modifier unbankOwnerDoesNotExist(address owner) {
        require(!unbankOwners[owner]);
        _;
    }

    modifier unbankOwnerExists(address owner) {
        require(unbankOwners[owner]);
        _;
    }

    modifier anyOwner(address _owner) {
        require(unbankOwners[_owner] || owner == _owner );
        _;
    }

    modifier notNull(address _address) {
        require(_address !=address(0));
        _;
    }


    /*
     * Public functions
     */
    constructor () public {
        address unbankAdmin1 = 0xAd2bAC8895B4EaFcc97B72387C586f601D53B240;
        address unbankAdmin2 = 0x2389D6EedCc212D9B4bf82c62c36031ea904F265;
        address unbankAdmin3 = 0x6231B14506B07dd238ae321b2e5e8356c5F516BE;

        unbankOwners[unbankAdmin1] = true;
        unbankOwners[unbankAdmin2] = true;
        unbankOwners[unbankAdmin3] = true;

        owners.push(unbankAdmin1);
        owners.push(unbankAdmin2);
        owners.push(unbankAdmin3);
    }

    /// @dev Allows to add a new Unbank's Admin.
    /// @param _newOwner Unbank admin owner Address.
    function addUnbankOwner(address _newOwner) public unbankOwnerDoesNotExist(_newOwner) unbankOwnerExists(msg.sender) notNull(_newOwner)  {
        require(newUnbankOwners[_newOwner] == 0);
        require(_newOwner != msg.sender);
        newUnbankOwners[_newOwner] = 1;
        notValidedOwners.push(_newOwner);
        notValidedOwnersIndex[_newOwner] = notValidedOwners.length.sub(1);
        addUnbankOwnerHistory[_newOwner][msg.sender] = true;
    }

    /// @dev Valid a new UnbankOwner
    /// @param _owner Unbank admin owner Address.
    function validNewUnbankOwner(address _owner) public unbankOwnerDoesNotExist(_owner) unbankOwnerExists(msg.sender) notNull(_owner) returns(bool) {
        require(!addUnbankOwnerHistory[_owner][msg.sender]);
        addUnbankOwnerHistory[_owner][msg.sender] = true;
        newUnbankOwners[_owner] = newUnbankOwners[_owner].add(1);
        if (newUnbankOwners[_owner] >= countSignAddOwner) {
            unbankOwners[_owner] = true;
            owners.push(_owner);
            delete notValidedOwners[notValidedOwnersIndex[owner]];
            emit EventOwnerAddition(_owner);
        }
        return true;
    }

    /// @dev Desactive an Unbank's Admin.
    /// @param owner Unbank admin owner Address.
    function desactiveUnbankOwner(address owner) public unbankOwnerExists(msg.sender) notNull(owner) requireDesactiveOwner returns (bool _response) {
        unbankOwners[owner] = false;
        ownerDesactive = ownerDesactive.add(1);
        emit EventDesactiveUnbankOwner(owner);
        return true;
    }

    /// @dev Active an Unbank's Admin.
    /// @param owner Unbank admin owner Address.
    function reactiveUnbankOwner(address owner) public unbankOwnerExists(msg.sender) notNull(owner) returns (bool _response) {
        unbankOwners[owner] = true;
        ownerDesactive = ownerDesactive.sub(1);
        emit EventReactiveUnbankOwner(owner);
        return true;
    }

    /// @dev Update destination address
    /// @param newDestination is the new destination address
    function setDestination(address newDestination) public unbankOwnerExists(msg.sender) notNull(newDestination) returns(bool)  {
        require(!checkSetDestinationAddress[newDestination][msg.sender]);
        checkSetDestinationAddress[newDestination][msg.sender] = true;
        countSetDestinationAddress[newDestination] = countSetDestinationAddress[newDestination].add(1);
        if (countSetDestinationAddress[newDestination] >= countSetDestination) {
            destination = newDestination;
            emit EventSetDestination(newDestination);
        }
        return true;
    }

    /// @dev Create a transaction to withdraw Token ERC20
    /// @param _amount is token's amount to withdraw
    /// @param _transactionId is Unique id to identify a transaction
    function createTransaction(uint _amount, uint _transactionId) public onlyOwner returns (bool) {
        require(_amount >0);
        require(owners.length.sub(ownerDesactive) >= 3);
        transactions[_transactionId] = Transaction(destination, _amount, max, min, 0, false, true);
        return true;
    }


    /// @dev Allows an owner to confirm a transaction.
    /// @param _transactionId Transaction ID.
    function confirmTransaction(uint _transactionId) public
        unbankOwnerExists(msg.sender) checkTransaction(_transactionId) validTransaction(_transactionId) returns(bool) {
        require(!transactions[_transactionId].confirm[msg.sender]);
        transactions[_transactionId].confirm[msg.sender] = true;
        transactions[_transactionId].countSignature = transactions[_transactionId].countSignature.add(1);

        if (transactions[_transactionId].countSignature >= min) {
            transactions[_transactionId].executed = true;
            token.transfer(destination, transactions[_transactionId].amount);
        }
        return true;
    }

    // @dev CountSignAddOwner update the number of UnbankOwners to add a new UnbankOwner
    function updateCountSignAddOwner(uint _count) public unbankOwnerExists(msg.sender) requireSetParams(_count) returns(bool response) {
        countSignAddOwner = _count;
        return true;
    }

    // @dev updateCountSetDestination update the number of UnbankOwners to update destination address
    function updateCountSetDestination(uint _count) public unbankOwnerExists(msg.sender) requireSetParams(_count) returns(bool response) {
        countSetDestination = _count;
        return true;
    }

    function updateRequirement(uint n, uint m) external unbankOwnerExists(msg.sender) returns(bool) {
        require(n>=2 && m>=n);
        min = n;
        max = m;
        emit EventUpdateRequirement(true);
        return true;
    }

    // Kill contract
    function kill() public unbankOwnerExists(msg.sender) notNull(msg.sender){
        uint allBalance = token.balanceOf(address(this));
        address payable _finalDestination = address(uint160(destination));
        require(token.transfer(_finalDestination, allBalance));
        selfdestruct(_finalDestination);
    }

    function getERC20Address(address externalAdd) external view returns(uint myBalance) {
        return token.balanceOf(externalAdd);
    }

    /// @dev Fallback function allows to deposit ether.
    function () payable external {
        if (msg.value > 0)
        emit EventDeposit(msg.sender, msg.value);
    }

    // @dev Return the MultiSigWallet token's balance
    function getMultiSigBalance() external view returns(uint) {
        return token.balanceOf(address(this));
    }

    // @dev Return the Destination token's balance
    function getDestinationBalance() external view returns(uint) {
        return token.balanceOf(destination);
    }

    /// @dev Returns list of UnbankOwners.
    /// @return List of UnbankOwner addresses.
    function getUnbankOwners() external view returns (address[] memory) {
        return owners;
    }

    function getDestinationAddress() external view returns(address hotWallet_address) {
        return destination;
    }

    function getNewOwnerNbrApprove(address _add) external view notNull(_add) returns(uint) {
        return newUnbankOwners[_add];
    }

    // @dev Check if am i a unbankOwner
    function checkIfAmValid() external view returns(bool) {
        return unbankOwners[msg.sender];
    }

    function knowIfAlreadyValidAddOwner(address _add) external view  notNull(_add) returns(bool) {
        return addUnbankOwnerHistory[_add][msg.sender];
    }

    // @dev Return a list of the futur unbankOwner
    function getNotValidedOwners() external view returns (address[] memory) {
        return notValidedOwners;
    }

    // @dev Return a Transction details
    function getTransactionDetails(uint _trxId) external view  anyOwner(msg.sender) checkTransaction(_trxId)
            returns(address _destination, uint _amount, uint _maxSignature, uint _minSignatures, uint _countSignature, bool _executed) {
        return (
            transactions[_trxId].destination,
            transactions[_trxId].amount,
            transactions[_trxId].maxSignature,
            transactions[_trxId].minSignatures,
            transactions[_trxId].countSignature,
            transactions[_trxId].executed
        );
    }

    function knowIfAlreadySignTransaction(uint _tr) external view  returns(bool) {
        return transactions[_tr].confirm[msg.sender];
    }

    function getRules() public view returns(uint minSignatures, uint maxSignatures) {
        return (min, max);
    }

}