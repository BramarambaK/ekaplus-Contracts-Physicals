package com.eka.consumer.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
public class ConnectDataSaveException extends RuntimeException {

    /**
     *
     */
    private static final long serialVersionUID = 1L;
    private static final String message = "Connect URL missing for tenant - ";

    public ConnectDataSaveException(String tenant) {
        super(message + tenant);
    }

    public ConnectDataSaveException(String tenant, Throwable ex) {
        super(message + tenant, ex);
    }

}
