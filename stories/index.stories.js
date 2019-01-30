/* eslint-disable react/react-in-jsx-scope, react/no-this-in-sfc */

import { storiesOf } from "@storybook/vue";

import SearchSelect from "../src/components/search-select.vue";

storiesOf("Welcome", module).add("to Storybook", () => ({
  components: { SearchSelect },
  template: `
  <div>
    <search-select
      id="searchyboi"
      :values="values"
      v-model="foo"
      @change="setVal"
    />
    <pre>{{foo}}</pre>
    <pre>{{JSON.stringify(val)}}</pre>
  </div>
  `,
  data() {
    return {
      foo: null,
      val: null,
      values: [
        { value: "chocolate", label: "Chocolate" },
        { value: "strawberry", label: "Strawberry" },
        { value: "vanilla", label: "Vanilla" }
      ]
    };
  },
  methods: {
    setVal(val) {
      this.val = val;
    }
  }
}));
