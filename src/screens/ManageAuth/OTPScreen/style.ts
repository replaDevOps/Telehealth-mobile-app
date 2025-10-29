import { StyleSheet } from "react-native";
import { mvs } from "../../../config/metrices";
import { colors } from "../../../styles/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: mvs(20),
    paddingVertical: "20%",

  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: mvs(20),
  },
  titleText: {
    fontSize: mvs(16),
    color: colors.black,
    marginBottom: mvs(8),
    fontWeight: "bold",
  },
  title: {
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: mvs(15),
    marginTop: mvs(6),
  },
  TextContent: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.secondaryText,
    textAlign:"center"
  },
  instructionText: {
    fontSize: mvs(14),
    width: mvs(290),
    lineHeight: mvs(23),
    color: colors.border,
    marginBottom: mvs(20),
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: mvs(15),
    marginTop: mvs(30),
  },
  inputBox: {
    borderWidth: 1,
    borderColor: colors.border,
    width: mvs(50),
    height: mvs(50),
    textAlign: "center",
    borderRadius: mvs(8),
    fontSize: mvs(18),
    color: colors.black,
    backgroundColor:colors.gray
  },
  resendText: {
    fontSize: mvs(15),
    color: colors.border,
    textAlign: "right",
    marginBottom: mvs(20),
    marginRight: mvs(40),
    // marginTop:mvs(10),
    // marginBottom:mvs(15)
  },
  resendLink: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
   
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    paddingVertical: 10,
    gap: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  signinLink: {
    color: colors.primary,
    fontWeight: '600',
    marginLeft: mvs(4),
  },
});
export default styles;
