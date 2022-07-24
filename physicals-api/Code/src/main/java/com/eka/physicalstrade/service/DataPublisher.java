package com.eka.physicalstrade.service;

import com.eka.physicals.dto.ContractDetailsDTO;
import com.eka.physicalstrade.dataobject.RequestContext;

public interface DataPublisher {

	public void publish(RequestContext requestContext,
			ContractDetailsDTO contractDetailsDTO);
}
