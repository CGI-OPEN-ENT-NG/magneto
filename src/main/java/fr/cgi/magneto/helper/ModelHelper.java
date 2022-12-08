package fr.cgi.magneto.helper;

import fr.cgi.magneto.model.Model;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class ModelHelper {

    private ModelHelper() {
        throw new IllegalStateException("Utility class");
    }

    @SuppressWarnings("unchecked")
    public static <T extends Model<T>> List<T> toList(JsonArray results, Class<T> modelClass) {
        return results.stream()
                .filter(JsonObject.class::isInstance)
                .map(JsonObject.class::cast)
                .map(iModel -> {
                    try {
                        return modelClass.getConstructor(JsonObject.class).newInstance(iModel);
                    } catch (NoSuchMethodException | InstantiationException | IllegalAccessException |
                             InvocationTargetException e) {
                        return null;
                    }
                }).filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public static JsonArray toJsonArray(List<? extends Model<?>> dataList) {
        return new JsonArray(dataList.stream().map(Model::toJson).collect(Collectors.toList()));
    }
}