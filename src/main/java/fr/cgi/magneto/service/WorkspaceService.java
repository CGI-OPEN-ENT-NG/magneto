package fr.cgi.magneto.service;

import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

public interface WorkspaceService {

    /**
     * Get document by identifier
     *
     * @param documentId Document identifier
     * @return Future {@link Future <JsonObject>} containing metadata of the document
     */
    Future<JsonObject> getDocument(String documentId);
}
