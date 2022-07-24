package com.eka.physicalstrade.dataobject;

import java.util.Date;

public class CreditCheckItemDetail {
	private String contractItemRefNo;
	private String payInCurrency;
	private double value;
	private Date fromPeriod;
	private Date toPeriod;

	public String getContractItemRefNo() {
		return contractItemRefNo;
	}

	public void setContractItemRefNo(String contractItemRefNo) {
		this.contractItemRefNo = contractItemRefNo;
	}

	public String getPayInCurrency() {
		return payInCurrency;
	}

	public void setPayInCurrency(String payInCurrency) {
		this.payInCurrency = payInCurrency;
	}

	public double getValue() {
		return value;
	}

	public void setValue(double value) {
		this.value = value;
	}

	public Date getFromPeriod() {
		return fromPeriod;
	}

	public void setFromPeriod(Date fromPeriod) {
		this.fromPeriod = fromPeriod;
	}

	public Date getToPeriod() {
		return toPeriod;
	}

	public void setToPeriod(Date toPeriod) {
		this.toPeriod = toPeriod;
	}
}
