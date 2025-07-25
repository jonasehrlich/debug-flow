import { usePaths } from "vitepress-openapi";
import spec from "../../../../openapi-schema.json" with { type: "json" };

export default {
  paths() {
    return usePaths({ spec })
      .getPathsByVerbs()
      .map(({ operationId, summary }) => {
        return {
          params: {
            operationId,
          },
        };
      });
  },
};
