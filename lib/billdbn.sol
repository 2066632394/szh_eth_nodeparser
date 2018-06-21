contract BillDb {
    mapping (uint => Bill) public bills; //票据集
	mapping (address => uint) investors; //投资者集，记录投资者地址和人民币资金余额信息
	mapping (address => Borrower) borrowers; //融资者集
    address public owner; //平台地址
    uint m_billcount; //票据计数
	uint feeRate; //平台手续费费率

    struct Bill //票据定义
    {
	    address borrower; //融资者
		uint bill; //票据票面价值，比如100万
		uint rmb; //票据融资额，比如90万
		uint unit; //向投资者出售时每份的价格，比如90块人民币
		uint count; //票据未出售的份数
		uint totalcount; //票据总共份数，比如10000份
	    uint     starttime;
	    uint     endtime;
	    Investor[]  investors; //投资了本票据的投资者地址和投资份数信息
    }

	struct Investor {
	    address investor; //投资者地址
		uint num; //投资份数
	}

	struct Borrower { //融资者定义
	    mapping(uint => uint) borrows; //融资者票据集，一个融资者可以同时有多个融资，key是票据ID，value是票据代币数
		uint rmb; //融资者人民币资金余额
	}

	event NewBill(address borrower, uint bill, uint rmb, uint unit, uint starttime, uint endtime);
	event InvestorDeposit(address investor, uint rmb);
	event InvestorWithdraw(address investor, uint rmb);
	event Invest(uint billId, uint num);
	event Deposit(address borrower, uint rmb);
	event Withdraw(address borrower, uint rmb);
	event InvestProfit(address investor, uint profit);
	event CloseBill(uint billId);

    function BillDb(uint fee) { //票据交易构造函数
    	owner = msg.sender;
    	m_billcount = 0;
		feeRate = fee;
    }

	function setFeeRate(uint fee) { //平台设置平台手续费费率接口
	    if (msg.sender != owner) {
		    return;
		}
		feeRate = fee;
	}
	
	//平台发布新票据项目供投资者投资接口
	function newBill(address borrower, uint bill, uint rmb, uint unit, uint starttime, uint endtime) returns (bool _success)  {
	    if (msg.sender != owner) {
		    return false;
		}
	    m_billcount++;
		bills[m_billcount].borrower = borrower; //票据融资者地址
		borrowers[borrower].borrows[m_billcount] = bill; //融资者本融资项目的票据代币数
		bills[m_billcount].bill = bill;
		bills[m_billcount].rmb = rmb;
		bills[m_billcount].unit = unit;
		bills[m_billcount].totalcount = rmb/unit;
		bills[m_billcount].count = rmb/unit;
		bills[m_billcount].starttime = starttime;
		bills[m_billcount].endtime = endtime;

		NewBill(borrower, bill, rmb, unit, starttime, endtime);
		
		return true;
	}

	//投资者存入资金接口
	function investorDeposit(address investor, uint rmb) returns (bool) {
	    if (msg.sender != owner) {
		    return false;
		}
		investors[investor] += rmb;
		InvestorDeposit(investor, rmb);
		return true;
	}

	//投资者取出资金接口
	function investorWithdraw(address investor, uint rmb) returns (bool) {
	    if (msg.sender != owner) {
		    return false;
		}
		if (investors[investor] < rmb) {
		    return false;
		}
		investors[investor] -= rmb;
		InvestorWithdraw(investor, rmb);
		return true;
	}

	//投资者投资票据接口，billId为票据ID，num为买入份数
	function invest(uint billId, uint num) returns (bool) {
	    if (num == 0) {
		    return false;
		}
	    address investor = msg.sender;
	    uint rmbOfInvestor = investors[investor];
	    if (rmbOfInvestor == 0) { //投资者未注册或者账户人民币余额为0
		    return false;
		}
		if (num * bills[billId].unit > rmbOfInvestor) { //账户资金不足
		    return false;
		}
		if (bills[billId].count < num) { //票据未售出份数不足
		    return false;
		}
		uint rmb = num * bills[billId].unit;
		uint bill = num * (bills[billId].bill/bills[billId].totalcount);
		bills[billId].count -= num;
		address borrower = bills[billId].borrower;
		borrowers[borrower].borrows[billId] -= bill; //融资者票据代币扣除
		borrowers[borrower].rmb += rmb; //投资款加入融资者账户
		investors[investor] -= rmb; //投资者账户扣款
		bills[billId].investors.push(Investor({investor: investor, num: num})); //记录投资者投资信息

		Invest(billId, num);
		
		return true;
	}

	//平台收到融资者款项后向其账户打入资金
	function deposit(address borrower, uint rmb) returns (bool) {
	    if (msg.sender != owner) {
		    return false;
		}
		borrowers[borrower].rmb += rmb;
		Deposit(borrower, rmb);
		return true;
	}

	//平台向融资者打款后从其账户减计
	function withdraw(address borrower, uint rmb) returns (bool) {
	    if (msg.sender != owner) {
		    return false;
		}
		uint borrowRmb = borrowers[borrower].rmb;
		if (borrowRmb < rmb) {
		    return false;
		}
		borrowers[borrower].rmb -= rmb;
		Withdraw(borrower, rmb);
		return true;
	}

	//融资者还款并关闭票据交易
	function closeBill(uint billId) returns (bool) {
	    address borrower = msg.sender;
	    if (bills[billId].borrower != borrower) {
		    return false;
		}
		if (borrowers[borrower].rmb < bills[billId].bill) { //融资者账户资金不足以还款
		    return false;
		}
		borrowers[borrower].rmb -= bills[billId].bill; //融资者账户扣款
		uint unitValue = bills[billId].bill/bills[billId].totalcount; //每份投资兑付时的价值
		for (uint i = 0; i < bills[billId].investors.length; i++) {
		    address investor = bills[billId].investors[i].investor;
			uint investValue = bills[billId].investors[i].num * unitValue;
			uint profit = investValue - investValue/feeRate;
		    investors[investor] += profit; //投资者账户打入资金并扣除平台手续费
			InvestProfit(investor, profit);
		}
		bills[billId].borrower = 0; //票据交易融资者地址置为0
		borrowers[borrower].borrows[billId] = 0; //票据交易融资者相应融资项票据代币置0
		CloseBill(billId);
		return true;
	}
}