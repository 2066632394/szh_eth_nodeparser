contract BillDb {
    mapping (uint => Bill) public bills; //Ʊ�ݼ�
	mapping (address => uint) investors; //Ͷ���߼�����¼Ͷ���ߵ�ַ��������ʽ������Ϣ
	mapping (address => Borrower) borrowers; //�����߼�
    address public owner; //ƽ̨��ַ
    uint m_billcount; //Ʊ�ݼ���
	uint feeRate; //ƽ̨�����ѷ���

    struct Bill //Ʊ�ݶ���
    {
	    address borrower; //������
		uint bill; //Ʊ��Ʊ���ֵ������100��
		uint rmb; //Ʊ�����ʶ����90��
		uint unit; //��Ͷ���߳���ʱÿ�ݵļ۸񣬱���90�������
		uint count; //Ʊ��δ���۵ķ���
		uint totalcount; //Ʊ���ܹ�����������10000��
	    uint     starttime;
	    uint     endtime;
	    Investor[]  investors; //Ͷ���˱�Ʊ�ݵ�Ͷ���ߵ�ַ��Ͷ�ʷ�����Ϣ
    }

	struct Investor {
	    address investor; //Ͷ���ߵ�ַ
		uint num; //Ͷ�ʷ���
	}

	struct Borrower { //�����߶���
	    mapping(uint => uint) borrows; //������Ʊ�ݼ���һ�������߿���ͬʱ�ж�����ʣ�key��Ʊ��ID��value��Ʊ�ݴ�����
		uint rmb; //������������ʽ����
	}

	event NewBill(address borrower, uint bill, uint rmb, uint unit, uint starttime, uint endtime);
	event InvestorDeposit(address investor, uint rmb);
	event InvestorWithdraw(address investor, uint rmb);
	event Invest(uint billId, uint num);
	event Deposit(address borrower, uint rmb);
	event Withdraw(address borrower, uint rmb);
	event InvestProfit(address investor, uint profit);
	event CloseBill(uint billId);

    function BillDb(uint fee) { //Ʊ�ݽ��׹��캯��
    	owner = msg.sender;
    	m_billcount = 0;
		feeRate = fee;
    }

	function setFeeRate(uint fee) { //ƽ̨����ƽ̨�����ѷ��ʽӿ�
	    if (msg.sender != owner) {
		    return;
		}
		feeRate = fee;
	}
	
	//ƽ̨������Ʊ����Ŀ��Ͷ����Ͷ�ʽӿ�
	function newBill(address borrower, uint bill, uint rmb, uint unit, uint starttime, uint endtime) returns (bool _success)  {
	    if (msg.sender != owner) {
		    return false;
		}
	    m_billcount++;
		bills[m_billcount].borrower = borrower; //Ʊ�������ߵ�ַ
		borrowers[borrower].borrows[m_billcount] = bill; //�����߱�������Ŀ��Ʊ�ݴ�����
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

	//Ͷ���ߴ����ʽ�ӿ�
	function investorDeposit(address investor, uint rmb) returns (bool) {
	    if (msg.sender != owner) {
		    return false;
		}
		investors[investor] += rmb;
		InvestorDeposit(investor, rmb);
		return true;
	}

	//Ͷ����ȡ���ʽ�ӿ�
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

	//Ͷ����Ͷ��Ʊ�ݽӿڣ�billIdΪƱ��ID��numΪ�������
	function invest(uint billId, uint num) returns (bool) {
	    if (num == 0) {
		    return false;
		}
	    address investor = msg.sender;
	    uint rmbOfInvestor = investors[investor];
	    if (rmbOfInvestor == 0) { //Ͷ����δע������˻���������Ϊ0
		    return false;
		}
		if (num * bills[billId].unit > rmbOfInvestor) { //�˻��ʽ���
		    return false;
		}
		if (bills[billId].count < num) { //Ʊ��δ�۳���������
		    return false;
		}
		uint rmb = num * bills[billId].unit;
		uint bill = num * (bills[billId].bill/bills[billId].totalcount);
		bills[billId].count -= num;
		address borrower = bills[billId].borrower;
		borrowers[borrower].borrows[billId] -= bill; //������Ʊ�ݴ��ҿ۳�
		borrowers[borrower].rmb += rmb; //Ͷ�ʿ�����������˻�
		investors[investor] -= rmb; //Ͷ�����˻��ۿ�
		bills[billId].investors.push(Investor({investor: investor, num: num})); //��¼Ͷ����Ͷ����Ϣ

		Invest(billId, num);
		
		return true;
	}

	//ƽ̨�յ������߿���������˻������ʽ�
	function deposit(address borrower, uint rmb) returns (bool) {
	    if (msg.sender != owner) {
		    return false;
		}
		borrowers[borrower].rmb += rmb;
		Deposit(borrower, rmb);
		return true;
	}

	//ƽ̨�������ߴ�������˻�����
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

	//�����߻���ر�Ʊ�ݽ���
	function closeBill(uint billId) returns (bool) {
	    address borrower = msg.sender;
	    if (bills[billId].borrower != borrower) {
		    return false;
		}
		if (borrowers[borrower].rmb < bills[billId].bill) { //�������˻��ʽ����Ի���
		    return false;
		}
		borrowers[borrower].rmb -= bills[billId].bill; //�������˻��ۿ�
		uint unitValue = bills[billId].bill/bills[billId].totalcount; //ÿ��Ͷ�ʶҸ�ʱ�ļ�ֵ
		for (uint i = 0; i < bills[billId].investors.length; i++) {
		    address investor = bills[billId].investors[i].investor;
			uint investValue = bills[billId].investors[i].num * unitValue;
			uint profit = investValue - investValue/feeRate;
		    investors[investor] += profit; //Ͷ�����˻������ʽ𲢿۳�ƽ̨������
			InvestProfit(investor, profit);
		}
		bills[billId].borrower = 0; //Ʊ�ݽ��������ߵ�ַ��Ϊ0
		borrowers[borrower].borrows[billId] = 0; //Ʊ�ݽ�����������Ӧ������Ʊ�ݴ�����0
		CloseBill(billId);
		return true;
	}
}